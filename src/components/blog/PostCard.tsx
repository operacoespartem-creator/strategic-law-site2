import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CoverArt from "@/components/blog/CoverArt";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import { formatDate, readingMinutes } from "@/lib/blog/utils";
import type { Post } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  featured?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const PostCard = ({ post, featured = false, className, style }: PostCardProps) => (
  <Link
    to={`/blog/${post.slug}`}
    className={cn("group block h-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent", className)}
    style={style}
  >
    <Card
      className={cn(
        "h-full overflow-hidden border-0 shadow-elegant transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl",
        featured ? "grid md:grid-cols-5" : "flex flex-col",
      )}
    >
      <div className={cn("overflow-hidden", featured ? "md:col-span-3 aspect-[1200/630] md:aspect-auto md:min-h-full" : "aspect-[1200/630]")}>
        <CoverArt
          preset={post.coverPreset}
          imageUrl={post.coverUrl}
          className="transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className={cn("flex flex-col", featured && "md:col-span-2 justify-center")}>
        <CardHeader className={cn(featured && "md:p-8")}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readingMinutes(post.contentHtml)} min de leitura
            </span>
          </div>
          <div className="inline-block self-start px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold mb-3">
            {post.area}
          </div>
          <CardTitle
            className={cn(
              "text-primary font-bold leading-snug group-hover:text-accent transition-colors",
              featured ? "text-2xl md:text-3xl" : "text-xl",
            )}
          >
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("mt-auto flex flex-col gap-5", featured && "md:px-8 md:pb-8")}>
          <CardDescription className={cn("text-base leading-relaxed", featured ? "line-clamp-4" : "line-clamp-3")}>
            {post.excerpt}
          </CardDescription>
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <span className="flex items-center gap-2 text-sm text-foreground min-w-0">
              <AuthorAvatar name={post.authorName} />
              <span className="truncate">{post.authorName}</span>
            </span>
            <span className="flex items-center gap-2 text-primary font-semibold text-sm shrink-0 group-hover:gap-3 transition-all">
              Ler artigo
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  </Link>
);

export default PostCard;
