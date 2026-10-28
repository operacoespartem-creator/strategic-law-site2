import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ArticleView from "@/components/blog/ArticleView";
import PostCard from "@/components/blog/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublishedPost, usePublishedPosts } from "@/hooks/useBlog";
import { WHATSAPP_NUMBER } from "@/lib/blog/config";

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  const previous = tag.getAttribute("content");
  tag.setAttribute("content", content);
  return () => {
    if (previous !== null) tag?.setAttribute("content", previous);
  };
};

const ArticlePage = () => {
  const { slug } = useParams();
  const { data: post, isLoading } = usePublishedPost(slug);
  const { data: all = [] } = usePublishedPosts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const previousTitle = document.title;
    document.title = `${post.title} | Lins Neves Advocacia`;
    const restoreDescription = setMeta("description", post.excerpt);
    return () => {
      document.title = previousTitle;
      restoreDescription();
    };
  }, [post]);

  const related = useMemo(() => {
    if (!post) return [];
    const others = all.filter((item) => item.id !== post.id);
    const sameArea = others.filter((item) => item.area === post.area);
    return [...sameArea, ...others.filter((item) => item.area !== post.area)].slice(0, 3);
  }, [all, post]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {isLoading && (
        <div className="pt-36 pb-16" style={{ background: "var(--gradient-hero)" }}>
          <div className="container mx-auto max-w-4xl px-4 space-y-5">
            <Skeleton className="h-5 w-32 bg-white/20" />
            <Skeleton className="h-12 w-5/6 bg-white/20" />
            <Skeleton className="h-6 w-2/3 bg-white/20" />
          </div>
        </div>
      )}

      {!isLoading && !post && (
        <section className="pt-40 pb-24 container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-8">O endereço pode ter mudado ou o artigo saiu do ar.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 font-semibold text-accent hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            Ver todos os artigos
          </Link>
        </section>
      )}

      {post && (
        <>
          <ArticleView post={post} />

          <section className="pb-16">
            <div className="container mx-auto max-w-3xl px-4">
              <div className="rounded-lg bg-primary p-8 md:p-10 text-white">
                <h2 className="text-2xl font-bold mb-3">Precisa de orientação sobre esse tema?</h2>
                <p className="text-white/80 mb-6">
                  Fale com a equipe Lins Neves. Atendemos empresas em Recife, Brasília e em todo o país.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Li o artigo "${post.title}" e gostaria de conversar com o escritório.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-semibold text-white hover:bg-accent/90 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar pelo WhatsApp
                </a>
              </div>
            </div>
          </section>

          {related.length > 0 && (
            <section className="py-16 bg-muted">
              <div className="container mx-auto px-4">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <h2 className="text-3xl font-bold text-primary">Leia também</h2>
                  <Link to="/blog" className="font-semibold text-accent hover:text-primary">
                    Ver todos
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {related.map((item) => (
                    <PostCard key={item.id} post={item} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default ArticlePage;
