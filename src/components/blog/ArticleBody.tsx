import { useMemo } from "react";
import { sanitizeHtml } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";

export const articleProseClass =
  "prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-bold prose-h2:mt-10 prose-h3:mt-8 " +
  "prose-p:text-foreground prose-p:leading-relaxed prose-li:text-foreground prose-li:marker:text-accent " +
  "prose-a:text-accent prose-a:font-semibold hover:prose-a:text-primary prose-strong:text-primary " +
  "prose-blockquote:border-l-accent prose-blockquote:text-primary/80 prose-blockquote:font-normal";

const ArticleBody = ({ html, className }: { html: string; className?: string }) => {
  const clean = useMemo(() => sanitizeHtml(html), [html]);
  return <div className={cn(articleProseClass, className)} dangerouslySetInnerHTML={{ __html: clean }} />;
};

export default ArticleBody;
