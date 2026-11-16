import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, Eye, ImagePlus, Loader2, PenLine, Send, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import ArticleView from "@/components/blog/ArticleView";
import CoverArt from "@/components/blog/CoverArt";
import LinkPreviewCard from "@/components/blog/LinkPreviewCard";
import RichTextEditor from "@/components/blog/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDeletePost, usePost, useSavePost } from "@/hooks/useBlog";
import { BLOG_AREAS, SIGNATURE_SUGGESTIONS } from "@/lib/blog/config";
import { COVER_PRESETS } from "@/lib/blog/covers";
import { blogStore } from "@/lib/blog/store";
import { canPublish, isLive, isScheduled, type Member, type Post, type PostInput, type PostStatus } from "@/lib/blog/types";
import { formatDateTime, htmlToText, prepareCoverImage, slugify } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";
import { STATUS_CLASS, STATUS_LABEL, statusDate, statusKey } from "./status";

type Draft = Omit<PostInput, "id">;

const EXCERPT_LIMIT = 200;

const emptyDraft = (member: Member): Draft => ({
  slug: "",
  title: "",
  excerpt: "",
  contentHtml: "",
  area: "",
  coverPreset: 0,
  coverUrl: null,
  authorEmail: null,
  authorName: "",
  authorTitle: "",
  status: "rascunho",
  publishedAt: null,
});

const toDraft = (post: Post): Draft => ({
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  contentHtml: post.contentHtml,
  area: post.area,
  coverPreset: post.coverPreset,
  coverUrl: post.coverUrl,
  authorEmail: post.authorEmail,
  authorName: post.authorName,
  authorTitle: post.authorTitle,
  status: post.status,
  publishedAt: post.publishedAt,
});

const toLocalInput = (iso: string | null) => (iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : "");

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-lg bg-background p-5 shadow-elegant">
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">{title}</h2>
    <div className="space-y-4">{children}</div>
  </section>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-sm text-destructive">{message}</p> : null;

const PainelEditor = ({ member }: { member: Member }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: existing, isLoading } = usePost(id);
  const save = useSavePost();
  const removePost = useDeletePost();

  const [draft, setDraft] = useState<Draft>(() => emptyDraft(member));
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(emptyDraft(member)));
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [tab, setTab] = useState<"escrever" | "previa">("escrever");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scheduleMode, setScheduleMode] = useState<"agora" | "agendar">("agora");
  const [scheduleAt, setScheduleAt] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // O campo do título cresce conforme o texto, sem barra de rolagem
  useLayoutEffect(() => {
    const field = titleRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  }, [draft.title, tab]);

  useEffect(() => {
    if (existing && existing.id !== loadedId) {
      const loaded = toDraft(existing);
      setDraft(loaded);
      setSavedSnapshot(JSON.stringify(loaded));
      setLoadedId(existing.id);
      setSlugTouched(true);
      if (isScheduled(existing)) {
        setScheduleMode("agendar");
        setScheduleAt(toLocalInput(existing.publishedAt));
      }
    }
  }, [existing, loadedId]);

  const reviewer = canPublish(member);
  const current = existing ?? null;
  const live = current ? isLive(current) : false;
  const scheduled = current ? isScheduled(current) : false;
  const slugLocked = live;
  const effectiveSlug = slugTouched ? draft.slug : slugify(draft.title);
  const dirty = JSON.stringify({ ...draft, slug: effectiveSlug }) !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const previewPost = useMemo(
    () => ({
      ...draft,
      slug: effectiveSlug,
      publishedAt:
        scheduleMode === "agendar" && scheduleAt
          ? new Date(scheduleAt).toISOString()
          : draft.publishedAt ?? new Date().toISOString(),
    }),
    [draft, effectiveSlug, scheduleMode, scheduleAt],
  );

  if (id && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (id && !isLoading && !existing) {
    return (
      <div className="rounded-lg bg-background p-10 text-center shadow-elegant">
        <p className="mb-2 text-lg font-semibold text-primary">Artigo não encontrado</p>
        <p className="mb-6 text-muted-foreground">Ele pode ter sido excluído.</p>
        <Button asChild variant="outline">
          <Link to="/blog/painel">Voltar aos artigos</Link>
        </Button>
      </div>
    );
  }

  const validate = (forPublishing: boolean) => {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = "Dê um título ao artigo.";
    if (forPublishing) {
      if (!draft.area) next.area = "Escolha a área do artigo.";
      if (!draft.authorName.trim()) next.signature = "Informe quem assina o artigo.";
      if (!draft.excerpt.trim()) next.excerpt = "Escreva um resumo de uma ou duas frases.";
      if (!htmlToText(draft.contentHtml).trim()) next.content = "O texto do artigo está vazio.";
      if (reviewer && !live && scheduleMode === "agendar" && (!scheduleAt || Date.parse(scheduleAt) <= Date.now())) {
        next.schedule = "Escolha uma data e hora no futuro.";
      }
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setTab("escrever");
      toast.error("Faltam informações para continuar. Veja os campos marcados.");
    }
    return Object.keys(next).length === 0;
  };

  const persist = async (status: PostStatus, publishedAt: string | null, message: string) => {
    const input: PostInput = { ...draft, id: current?.id, slug: effectiveSlug, status, publishedAt };
    try {
      const result = await save.mutateAsync(input);
      const next = toDraft(result);
      setDraft(next);
      setSavedSnapshot(JSON.stringify(next));
      setSlugTouched(true);
      setErrors({});
      toast.success(
        message,
        isLive(result)
          ? { action: { label: "Ver no blog", onClick: () => navigate(`/blog/${result.slug}`) } }
          : undefined,
      );
      if (!current) navigate(`/blog/painel/editar/${result.id}`, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o artigo.");
    }
  };

  const saveDraft = () => {
    if (!validate(false)) return;
    const status: PostStatus = draft.status === "publicado" ? "publicado" : draft.status === "revisao" ? "revisao" : "rascunho";
    persist(status, draft.publishedAt, status === "publicado" ? "Alterações publicadas" : "Rascunho salvo");
  };

  const sendToReview = () => {
    if (!validate(true)) return;
    persist("revisao", null, "Artigo enviado para revisão");
  };

  const publish = () => {
    if (!validate(true)) return;
    if (live) {
      persist("publicado", draft.publishedAt, "Alterações publicadas");
      return;
    }
    if (scheduleMode === "agendar") {
      const when = new Date(scheduleAt).toISOString();
      persist("publicado", when, `Publicação agendada para ${formatDateTime(when)}`);
      return;
    }
    persist("publicado", new Date().toISOString(), "Artigo publicado");
  };

  const unpublish = () => {
    setScheduleMode("agora");
    setScheduleAt("");
    persist("rascunho", null, "Artigo retirado do ar. Ele voltou para os rascunhos.");
  };

  const remove = async () => {
    if (!current) return;
    try {
      await removePost.mutateAsync(current.id);
      toast.success("Artigo excluído");
      navigate("/blog/painel");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o artigo.");
    }
  };

  const onCoverFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha um arquivo de imagem, em JPG ou PNG.");
      return;
    }
    setUploading(true);
    try {
      const image = await prepareCoverImage(file);
      update({ coverUrl: await blogStore.uploadCover(image) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível usar essa imagem.");
    } finally {
      setUploading(false);
    }
  };

  const onSignatureName = (name: string) => {
    const known = SIGNATURE_SUGGESTIONS.find((item) => item.name.toLowerCase() === name.trim().toLowerCase());
    update({ authorName: name, authorTitle: known ? known.title : draft.authorTitle });
  };

  const busy = save.isPending || removePost.isPending;
  const canDelete = current && (reviewer || (current.authorEmail === member.email && current.status !== "publicado"));
  const key = current ? statusKey(current) : "rascunho";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/blog/painel" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-accent">
          <ArrowLeft className="h-5 w-5" />
          Artigos
        </Link>
        <div className="flex items-center gap-3">
          <span className={cn("text-sm", dirty ? "text-amber-700" : "text-muted-foreground")} aria-live="polite">
            {dirty ? "Alterações não salvas" : current ? "Tudo salvo" : ""}
          </span>
          <div className="inline-flex rounded-lg bg-background p-1 shadow-sm" role="tablist" aria-label="Modo do editor">
            {(
              [
                ["escrever", "Escrever", PenLine],
                ["previa", "Prévia", Eye],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
                  tab === value ? "bg-primary text-white" : "text-primary hover:text-accent",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {tab === "escrever" ? (
            <>
              <div className="rounded-lg bg-background p-5 shadow-elegant md:p-8">
                <Label htmlFor="artigo-titulo" className="sr-only">
                  Título
                </Label>
                <Textarea
                  ref={titleRef}
                  id="artigo-titulo"
                  rows={1}
                  value={draft.title}
                  onChange={(event) => update({ title: event.target.value.replace(/\n/g, " ") })}
                  placeholder="Título do artigo"
                  aria-invalid={Boolean(errors.title)}
                  className="min-h-0 resize-none overflow-hidden border-0 px-0 text-3xl font-bold leading-tight text-primary shadow-none placeholder:text-primary/30 focus-visible:ring-0 focus-visible:ring-offset-0 md:text-4xl"
                />
                <FieldError message={errors.title} />

                <div className="mt-6 space-y-2 border-t border-border pt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <Label htmlFor="artigo-resumo" className="font-semibold text-primary">
                      Resumo
                    </Label>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        draft.excerpt.length > 160 ? "text-amber-700" : "text-muted-foreground",
                      )}
                    >
                      {draft.excerpt.length}/{EXCERPT_LIMIT}
                    </span>
                  </div>
                  <Textarea
                    id="artigo-resumo"
                    rows={3}
                    maxLength={EXCERPT_LIMIT}
                    value={draft.excerpt}
                    onChange={(event) => update({ excerpt: event.target.value })}
                    placeholder="Uma ou duas frases sobre o artigo."
                    aria-invalid={Boolean(errors.excerpt)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparece no Google, na prévia do WhatsApp e nos cards do blog. O ideal é até 160 caracteres.
                  </p>
                  <FieldError message={errors.excerpt} />
                </div>
              </div>

              <div className="space-y-2">
                <RichTextEditor
                  value={draft.contentHtml}
                  onChange={(html) => update({ contentHtml: html })}
                  invalid={Boolean(errors.content)}
                />
                <FieldError message={errors.content} />
              </div>
            </>
          ) : (
            <div className="overflow-hidden rounded-lg bg-background shadow-elegant">
              <p className="border-b border-border bg-accent/10 px-5 py-3 text-sm font-semibold text-primary">
                Prévia. É assim que o artigo vai aparecer no site.
              </p>
              <ArticleView post={previewPost} preview />
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Section title="Publicação">
            {current && (
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", STATUS_CLASS[key])}>
                  {STATUS_LABEL[key]}
                </span>
                <span className="text-xs text-muted-foreground">{statusDate(current)}</span>
              </div>
            )}

            {reviewer ? (
              <>
                {!live && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="radiogroup" aria-label="Quando publicar">
                      {(
                        [
                          ["agora", "Publicar agora"],
                          ["agendar", "Agendar"],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={scheduleMode === value}
                          onClick={() => setScheduleMode(value)}
                          className={cn(
                            "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                            scheduleMode === value ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-primary",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {scheduleMode === "agendar" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="artigo-agendar">Data e hora</Label>
                        <Input
                          id="artigo-agendar"
                          type="datetime-local"
                          value={scheduleAt}
                          min={toLocalInput(new Date().toISOString())}
                          onChange={(event) => setScheduleAt(event.target.value)}
                          aria-invalid={Boolean(errors.schedule)}
                        />
                        <FieldError message={errors.schedule} />
                      </div>
                    )}
                  </div>
                )}
                <Button type="button" className="w-full" size="lg" onClick={publish} disabled={busy}>
                  {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : scheduleMode === "agendar" && !live ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {live ? "Salvar alterações" : scheduleMode === "agendar" ? (scheduled ? "Atualizar agendamento" : "Agendar publicação") : "Publicar agora"}
                </Button>
                {!live && !scheduled && (
                  <Button type="button" variant="outline" className="w-full" onClick={saveDraft} disabled={busy}>
                    Salvar rascunho
                  </Button>
                )}
                {(live || scheduled) && (
                  <Button type="button" variant="outline" className="w-full" onClick={unpublish} disabled={busy}>
                    Tirar do ar
                  </Button>
                )}
              </>
            ) : (
              <>
                {current?.status === "revisao" && (
                  <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">Aguardando a revisão de um sócio.</p>
                )}
                <Button type="button" className="w-full" size="lg" onClick={sendToReview} disabled={busy}>
                  {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {current?.status === "revisao" ? "Reenviar para revisão" : "Enviar para revisão"}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={saveDraft} disabled={busy}>
                  Salvar rascunho
                </Button>
                <p className="text-xs text-muted-foreground">Um sócio revisa o texto e publica no site.</p>
              </>
            )}

            {canDelete &&
              (confirmDelete ? (
                <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm text-foreground">Excluir este artigo? Essa ação não pode ser desfeita.</p>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Cancelar
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={remove} disabled={busy}>
                      Excluir
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive hover:underline"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir artigo
                </button>
              ))}
          </Section>

          <Section title="Detalhes">
            <div className="space-y-1.5">
              <Label htmlFor="artigo-area">Área</Label>
              <Select value={draft.area || undefined} onValueChange={(value) => update({ area: value })}>
                <SelectTrigger id="artigo-area" aria-invalid={Boolean(errors.area)}>
                  <SelectValue placeholder="Escolha a área" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set([...BLOG_AREAS, ...(draft.area ? [draft.area] : [])])).map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.area} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="artigo-assinatura">Assinatura</Label>
              <Input
                id="artigo-assinatura"
                list="assinaturas-equipe"
                value={draft.authorName}
                onChange={(event) => onSignatureName(event.target.value)}
                placeholder="Nome de quem escreveu"
                aria-invalid={Boolean(errors.signature)}
              />
              <datalist id="assinaturas-equipe">
                {SIGNATURE_SUGGESTIONS.map((item) => (
                  <option key={item.email} value={item.name} />
                ))}
              </datalist>
              <Input
                id="artigo-assinatura-cargo"
                aria-label="Cargo de quem assina"
                value={draft.authorTitle ?? ""}
                onChange={(event) => update({ authorTitle: event.target.value })}
                placeholder="Cargo (ex.: Advogada, Head da Área Tributária)"
              />
              <p className="text-xs text-muted-foreground">Aparece no fim do artigo, como responsável pelo texto.</p>
              <FieldError message={errors.signature} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="artigo-endereco">Endereço do artigo</Label>
              {slugLocked ? (
                <>
                  <p className="break-all rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs">
                    linsneves.com.br/blog/{effectiveSlug}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    O endereço não muda depois de publicado, para não quebrar links já compartilhados.
                  </p>
                </>
              ) : (
                <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <span className="whitespace-nowrap pl-3 font-mono text-xs text-muted-foreground">/blog/</span>
                  <input
                    id="artigo-endereco"
                    value={effectiveSlug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      update({
                        slug: event.target.value
                          .normalize("NFD")
                          .replace(/[̀-ͯ]/g, "")
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, "-"),
                      });
                    }}
                    placeholder="gerado-pelo-titulo"
                    className="min-w-0 flex-1 bg-transparent px-1 py-2 font-mono text-xs focus:outline-none"
                  />
                </div>
              )}
            </div>
          </Section>

          <Section title="Capa">
            <div className="aspect-[1200/630] overflow-hidden rounded-md ring-1 ring-border">
              <CoverArt preset={draft.coverPreset} imageUrl={draft.coverUrl} />
            </div>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Capas prontas">
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={!draft.coverUrl && draft.coverPreset === preset.id}
                  title={`Capa ${preset.name}`}
                  onClick={() => update({ coverPreset: preset.id, coverUrl: null })}
                  className={cn(
                    "aspect-[1200/630] overflow-hidden rounded ring-offset-2 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    !draft.coverUrl && draft.coverPreset === preset.id ? "ring-2 ring-accent" : "ring-1 ring-border hover:ring-accent/60",
                  )}
                >
                  <CoverArt preset={preset.id} />
                  <span className="sr-only">{preset.name}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="artigo-capa-arquivo"
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary hover:border-accent hover:text-accent",
                  uploading && "pointer-events-none opacity-60",
                )}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {draft.coverUrl ? "Trocar imagem" : "Enviar imagem"}
              </label>
              <input id="artigo-capa-arquivo" type="file" accept="image/*" className="sr-only" onChange={onCoverFile} />
              {draft.coverUrl && (
                <button
                  type="button"
                  onClick={() => update({ coverUrl: null })}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                  Usar capa pronta
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Imagem horizontal, de preferência 1200 × 630 px.</p>
          </Section>

          <Section title="Prévia no WhatsApp">
            <LinkPreviewCard
              title={draft.title}
              excerpt={draft.excerpt}
              coverPreset={draft.coverPreset}
              coverUrl={draft.coverUrl}
            />
          </Section>
        </aside>
      </div>
    </div>
  );
};

export default PainelEditor;
