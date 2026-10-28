import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, LogOut, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import logoAzul from "@/assets/logo-lins-neves-azul.png";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import { Button } from "@/components/ui/button";
import { useResetDemo, useSignOut } from "@/hooks/useBlog";
import { BLOG_MODE } from "@/lib/blog/config";
import type { Session } from "@/lib/blog/types";
import { ROLE_LABEL } from "./status";

const PainelLayout = ({ session, children }: { session: Session | null; children: React.ReactNode }) => {
  const signOut = useSignOut();
  const resetDemo = useResetDemo();
  const navigate = useNavigate();
  const member = session?.member;

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link to="/blog/painel" className="flex min-w-0 items-center gap-3">
            <img src={logoAzul} alt="Lins Neves Advocacia" className="h-8 w-auto" />
            <span className="hidden border-l border-border pl-3 text-sm font-semibold text-muted-foreground sm:inline">
              Painel do blog
            </span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-primary hover:text-accent"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Ver blog</span>
            </Link>
            {member && (
              <div className="flex items-center gap-3 border-l border-border pl-3 md:pl-4">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-semibold leading-tight text-primary">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABEL[member.role]}</p>
                </div>
                <AuthorAvatar name={member.name} size="md" />
              </div>
            )}
            {session && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut.mutate(undefined, { onSuccess: () => navigate("/blog/painel") })}
                className="text-primary"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {BLOG_MODE === "demo" && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="container mx-auto flex flex-col gap-2 px-4 py-2.5 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong>Modo demonstração.</strong> Os artigos ficam salvos só neste navegador. Para publicar de verdade, o
              painel precisa ser ligado ao Supabase.
            </p>
            <button
              type="button"
              onClick={() =>
                resetDemo.mutate(undefined, { onSuccess: () => toast.success("Exemplos restaurados") })
              }
              className="inline-flex shrink-0 items-center gap-1.5 self-start font-semibold text-amber-900 underline-offset-4 hover:underline sm:self-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar exemplos
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 md:py-10">{children}</main>
    </div>
  );
};

export default PainelLayout;
