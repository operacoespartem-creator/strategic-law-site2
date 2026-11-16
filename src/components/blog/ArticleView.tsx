import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import ArticleBody from "@/components/blog/ArticleBody";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import CoverArt from "@/components/blog/CoverArt";
import ShareButtons from "@/components/blog/ShareButtons";
import { formatDate, postUrl, readingMinutes } from "@/lib/blog/utils";
import type { Post } from "@/lib/blog/types";

interface ArticleViewProps {
  post: Pick<
    Post,
    "slug" | "title" | "excerpt" | "contentHtml" | "area" | "coverPreset" | "coverUrl" | "authorName" | "authorTitle" | "publishedAt"
  >;
  /** Na prévia do painel não há link de voltar nem botões de compartilhar. */
  preview?: boolean;
}

/** Cabeçalho, capa e texto do artigo. Usado na página pública e na prévia do painel. */
const ArticleView = ({ post, preview = false }: ArticleViewProps) => (
  <article>
    <header
      className={preview ? "pt-12 pb-32 md:pb-40" : "pt-32 pb-32 md:pt-40 md:pb-40"}
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="container mx-auto max-w-4xl px-4">
        {!preview && (
          <Link
            to="/blog"
            className="group mb-8 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao blog</span>
          </Link>
        )}
        <div>
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
            {post.area || "Área"}
          </span>
        </div>
        <h1 className="mt-5 mb-6 text-3xl md:text-5xl font-bold leading-tight text-white text-balance">
          {post.title || "Título do artigo"}
        </h1>
        {post.excerpt && <p className="max-w-3xl text-lg md:text-xl text-white/85">{post.excerpt}</p>}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
          <span className="flex items-center gap-3">
            <AuthorAvatar name={post.authorName || "Lins Neves Advocacia"} size="md" tone="dark" />
            <span>
              <span className="block font-semibold text-white">{post.authorName || "Assinatura"}</span>
              {post.authorTitle && <span className="block">{post.authorTitle}</span>}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {post.publishedAt ? formatDate(post.publishedAt) : "Data de publicação"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {readingMinutes(post.contentHtml)} min de leitura
          </span>
        </div>
      </div>
    </header>

    <div className="container mx-auto max-w-4xl px-4 -mt-24 md:-mt-28">
      <div className="aspect-[1200/630] overflow-hidden rounded-lg shadow-elegant ring-1 ring-black/5">
        <CoverArt preset={post.coverPreset} imageUrl={post.coverUrl} alt={post.title} />
      </div>
    </div>

    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <ArticleBody html={post.contentHtml || "<p>O texto do artigo aparece aqui.</p>"} />


      <div className="mt-12 border-t border-border pt-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Assinatura</p>
        <div className="flex items-center gap-4">
          <AuthorAvatar name={post.authorName || "Lins Neves Advocacia"} size="lg" />
          <div>
            <p className="text-xl font-bold text-primary">{post.authorName || "Nome de quem assina"}</p>
            {post.authorTitle && <p className="text-muted-foreground">{post.authorTitle}</p>}
            {post.authorName !== "Lins Neves Advocacia" && <p className="text-sm text-muted-foreground">Lins Neves Advocacia</p>}
          </div>
        </div>
      </div>

      {!preview && (
        <div className="mt-8">
          <ShareButtons title={post.title} url={postUrl(post)} />
        </div>
      )}
    </div>
  </article>
);

export default ArticleView;
