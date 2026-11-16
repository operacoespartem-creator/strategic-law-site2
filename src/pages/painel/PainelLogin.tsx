import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logoAzul from "@/assets/logo-lins-neves-azul.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn, useSignOut } from "@/hooks/useBlog";
import { BLOG_LOGIN_EMAIL, BLOG_MODE } from "@/lib/blog/config";
import type { Session } from "@/lib/blog/types";

/** Login único do painel do blog: um e-mail e uma senha compartilhados pela equipe. */
const PainelLogin = ({ session }: { session: Session | null }) => {
  const signIn = useSignIn();
  const signOut = useSignOut();
  const [email, setEmail] = useState(BLOG_LOGIN_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Preencha o e-mail e a senha do painel.");
      return;
    }
    setError(null);
    signIn.mutate(
      { email, password },
      { onError: (err) => setError(err instanceof Error ? err.message : "Não foi possível entrar.") },
    );
  };

  if (session && !session.member) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-background p-8 text-center shadow-elegant">
        <h1 className="mb-3 text-2xl font-bold text-primary">Sem acesso ao painel</h1>
        <p className="mb-6 text-muted-foreground">
          O e-mail <strong className="text-foreground">{session.email}</strong> não está liberado para publicar no blog.
        </p>
        <Button variant="outline" onClick={() => signOut.mutate()}>
          Entrar com outro login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg bg-background p-8 shadow-elegant md:p-10">
        <img src={logoAzul} alt="Lins Neves Advocacia" className="mb-8 h-10 w-auto" />
        <h1 className="mb-2 text-3xl font-bold text-primary">Painel do blog</h1>
        <p className="mb-8 text-muted-foreground">Entre com o login do escritório para escrever e publicar artigos.</p>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="painel-email">E-mail</Label>
            <Input
              id="painel-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="painel-senha">Senha</Label>
            <div className="relative">
              <Input
                id="painel-senha"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-11"
                aria-invalid={Boolean(error)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-2 text-muted-foreground hover:text-primary"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={signIn.isPending}>
            {signIn.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>

        {BLOG_MODE === "demo" && (
          <p className="mt-6 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
            Demonstração: digite qualquer senha para entrar.
          </p>
        )}
      </div>
    </div>
  );
};

export default PainelLogin;
