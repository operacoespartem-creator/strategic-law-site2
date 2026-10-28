import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import PostCard from "@/components/blog/PostCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublishedPosts } from "@/hooks/useBlog";
import { htmlToText } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const BlogPage = () => {
  const { data: posts = [], isLoading, isError } = usePublishedPosts();
  const [area, setArea] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Blog | Lins Neves Advocacia";
  }, []);

  const areas = useMemo(() => Array.from(new Set(posts.map((post) => post.area))).sort(), [posts]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return posts.filter((post) => {
      if (area && post.area !== area) return false;
      if (!q) return true;
      return normalize(`${post.title} ${post.excerpt} ${post.authorName} ${htmlToText(post.contentHtml)}`).includes(q);
    });
  }, [posts, area, query]);

  const showFeatured = !area && !query && filtered.length > 0;
  const [featured, ...rest] = filtered;
  const grid = showFeatured ? rest : filtered;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-24" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute -right-24 -top-24 h-96 w-96 rotate-12 bg-white/5" aria-hidden="true" />
        <div className="absolute right-[12%] top-24 h-24 w-24 bg-accent/60" aria-hidden="true" />
        <div className="relative z-10 container mx-auto px-4">
          <p className="text-accent font-semibold uppercase tracking-[0.25em] text-sm mb-4">Blog</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 max-w-3xl">Insights Estratégicos e Publicações</h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl">
            Conhecimento e análise jurídica aplicada ao mundo dos negócios, escritos pela equipe Lins Neves.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted min-h-[50vh]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-10">
            <div className="flex flex-wrap gap-2 flex-1" role="group" aria-label="Filtrar por área">
              {[null, ...areas].map((item) => (
                <button
                  key={item ?? "todas"}
                  type="button"
                  onClick={() => setArea(item)}
                  aria-pressed={area === item}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    area === item
                      ? "bg-primary border-primary text-white"
                      : "bg-background border-border text-primary hover:border-accent hover:text-accent",
                  )}
                >
                  {item ?? "Todas as áreas"}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="blog-busca"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar artigos"
                aria-label="Buscar artigos"
                className="pl-9 bg-background"
              />
            </div>
          </div>

          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-4 rounded-lg bg-background p-4 shadow-elegant">
                  <Skeleton className="aspect-[1200/630] w-full" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <p className="rounded-lg bg-background p-8 text-center text-muted-foreground shadow-elegant">
              Não foi possível carregar os artigos agora. Tente recarregar a página.
            </p>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="rounded-lg bg-background p-10 text-center shadow-elegant">
              <p className="text-lg font-semibold text-primary mb-2">Nenhum artigo encontrado</p>
              <p className="text-muted-foreground">
                {posts.length === 0 ? "Os primeiros artigos serão publicados em breve." : "Tente outra área ou outra palavra na busca."}
              </p>
            </div>
          )}

          {showFeatured && featured && <PostCard post={featured} featured className="mb-8" />}

          {grid.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {grid.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default BlogPage;
