import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, PenLine, Plus } from "lucide-react";
import CoverArt from "@/components/blog/CoverArt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllPosts } from "@/hooks/useBlog";
import { canPublish, isLive, type Member, type Post } from "@/lib/blog/types";
import { cn } from "@/lib/utils";
import { STATUS_CLASS, STATUS_LABEL, statusDate, statusKey, type StatusKey } from "./status";

const FILTERS: { key: StatusKey | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "publicado", label: "Publicados" },
  { key: "agendado", label: "Agendados" },
  { key: "revisao", label: "Em revisão" },
  { key: "rascunho", label: "Rascunhos" },
];

const canEdit = (member: Member, post: Post) =>
  canPublish(member) || (post.authorEmail?.toLowerCase() === member.email.toLowerCase() && post.status !== "publicado");

const PainelDashboard = ({ member }: { member: Member }) => {
  const { data: posts = [], isLoading, isError } = useAllPosts();
  const [filter, setFilter] = useState<StatusKey | "todos">("todos");

  const counts = useMemo(() => {
    const result: Record<string, number> = { todos: posts.length };
    posts.forEach((post) => {
      const key = statusKey(post);
      result[key] = (result[key] ?? 0) + 1;
    });
    return result;
  }, [posts]);

  const visible = filter === "todos" ? posts : posts.filter((post) => statusKey(post) === filter);
  const waitingReview = counts.revisao ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Artigos</h1>
          <p className="text-muted-foreground">Escreva, revise e publique os artigos do blog.</p>
        </div>
        <Button asChild size="lg" className="self-start sm:self-auto">
          <Link to="/blog/painel/novo">
            <Plus className="h-5 w-5" />
            Novo artigo
          </Link>
        </Button>
      </div>

      {canPublish(member) && waitingReview > 0 && (
        <button
          type="button"
          onClick={() => setFilter("revisao")}
          className="flex w-full items-center justify-between gap-4 rounded-lg border border-sky-200 bg-sky-50 px-5 py-4 text-left text-sky-900 hover:bg-sky-100"
        >
          <span>
            <strong>
              {waitingReview === 1 ? "1 artigo aguarda" : `${waitingReview} artigos aguardam`} sua revisão.
            </strong>{" "}
            Abra, confira e publique.
          </span>
          <span className="shrink-0 text-sm font-semibold underline underline-offset-4">Ver</span>
        </button>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por situação">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              filter === item.key
                ? "border-primary bg-primary text-white"
                : "border-border bg-background text-primary hover:border-accent hover:text-accent",
            )}
          >
            {item.label}
            <span className={cn("tabular-nums text-xs", filter === item.key ? "text-white/70" : "text-muted-foreground")}>
              {counts[item.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg bg-background shadow-elegant">
        {isLoading &&
          [0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-4 border-b border-border p-5 last:border-0">
              <Skeleton className="hidden h-14 w-24 sm:block" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}

        {isError && <p className="p-8 text-center text-muted-foreground">Não foi possível carregar os artigos.</p>}

        {!isLoading && !isError && visible.length === 0 && (
          <div className="p-10 text-center">
            <p className="mb-2 font-semibold text-primary">Nenhum artigo aqui</p>
            <p className="text-muted-foreground">
              {filter === "todos" ? "Comece pelo botão Novo artigo." : "Nenhum artigo com essa situação no momento."}
            </p>
          </div>
        )}

        {visible.map((post) => {
          const key = statusKey(post);
          const editable = canEdit(member, post);
          return (
            <div
              key={post.id}
              className="grid grid-cols-1 gap-4 border-b border-border p-5 last:border-0 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="hidden aspect-[1200/630] w-24 overflow-hidden rounded sm:block">
                <CoverArt preset={post.coverPreset} imageUrl={post.coverUrl} />
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", STATUS_CLASS[key])}>
                    {STATUS_LABEL[key]}
                  </span>
                  <span className="text-xs text-muted-foreground">{statusDate(post)}</span>
                </div>
                {editable ? (
                  <Link
                    to={`/blog/painel/editar/${post.id}`}
                    className="block truncate text-lg font-semibold text-primary hover:text-accent"
                  >
                    {post.title || "Sem título"}
                  </Link>
                ) : (
                  <p className="truncate text-lg font-semibold text-primary">{post.title || "Sem título"}</p>
                )}
                <p className="truncate text-sm text-muted-foreground">
                  {post.area} · {post.authorName}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {editable && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/blog/painel/editar/${post.id}`}>
                      <PenLine className="h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                )}
                {isLive(post) && (
                  <Button asChild variant="ghost" size="sm" className="text-primary">
                    <Link to={`/blog/${post.slug}`}>
                      <ExternalLink className="h-4 w-4" />
                      Ver no site
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PainelDashboard;
