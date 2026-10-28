import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePublishedPosts } from "@/hooks/useBlog";
import { formatDate } from "@/lib/blog/utils";

/** Seção da página inicial com os 3 artigos mais recentes do blog. */
const Insights = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);
  const { data: posts = [], isLoading } = usePublishedPosts();
  const latest = posts.slice(0, 3);

  return (
    <section id="insights" className="py-20 bg-muted" ref={ref}>
      <div className="container mx-auto px-4">
        <h2 className={`text-4xl md:text-5xl font-bold text-center mb-4 text-primary transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          Insights Estratégicos e Publicações
        </h2>
        <p className={`text-center text-muted-foreground mb-16 text-lg transition-all duration-700 delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          Conhecimento e análise jurídica aplicada ao mundo dos negócios
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {isLoading &&
            [0, 1, 2].map((index) => (
              <Card key={index} className="shadow-elegant border-0">
                <CardHeader className="space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-7 w-5/6" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
              </Card>
            ))}

          {latest.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className={`group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${200 + index * 150}ms` }}
            >
              <Card className="h-full shadow-elegant hover-scale border-0">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <div className="inline-block self-start px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold mb-3">
                    {post.area}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                    <span>Ler artigo</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {!isLoading && latest.length === 0 && (
          <p className="text-center text-muted-foreground">Os primeiros artigos serão publicados em breve.</p>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Ver todos os artigos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Insights;
