import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import logoAzul from "@/assets/logo-lins-neves-azul.png";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn, useSignOut } from "@/hooks/useBlog";
import { BLOG_MODE, DEMO_MEMBERS } from "@/lib/blog/config";
import type { Member, Session } from "@/lib/blog/types";
import { ROLE_LABEL } from "./status";

const MemberButton = ({ member, onPick, busy }: { member: Member; onPick: () => void; busy: boolean }) => (
  <button
    type="button"
    onClick={onPick}
    disabled={busy}
    className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:border-accent hover:bg-accent/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
  >
    <AuthorAvatar name={member.name} size="md" />
    <span className="min-w-0">
      <span className="block truncate font-semibold text-primary">{member.name}</span>
      <span className="block truncate text-sm text-muted-foreground">{member.title}</span>
    </span>
  </button>
);

const PainelLogin = ({ session }: { session: Session | null }) => {
  const signIn = useSignIn();
  const signOut = useSignOut();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Digite um e-mail válido, por exemplo nome@linsneves.adv.br.");
      return;
    }
    setError(null);
    signIn.mutate(value, {
      onSuccess: (result) => {
        if (result === "link-enviado") setSentTo(value);
      },
      onError: (err) => setError(err instanceof Error ? err.message : "Não foi possível entrar."),
    });
  };

  if (session && !session.member) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-background p-8 text-center shadow-elegant">
        <h1 className="mb-3 text-2xl font-bold text-primary">Sem acesso ao painel</h1>
        <p className="mb-6 text-muted-foreground">
          O e-mail <strong className="text-foreground">{session.email}</strong> ainda não está cadastrado. Peça a um
          administrador do site para liberar o acesso.
        </p>
        <Button variant="outline" onClick={() => signOut.mutate()}>
          Entrar com outro e-mail
        </Button>
      </div>
    );
  }

  const partners = DEMO_MEMBERS.filter((member) => member.role !== "autor");
  const authors = DEMO_MEMBERS.filter((member) => member.role === "autor");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-background p-8 shadow-elegant md:p-10">
        <img src={logoAzul} alt="Lins Neves Advocacia" className="mb-8 h-10 w-auto" />
        <h1 className="mb-2 text-3xl font-bold text-primary">Painel do blog</h1>
        <p className="mb-8 text-muted-foreground">Entre com o e-mail do escritório para escrever e publicar artigos.</p>

        {BLOG_MODE === "supabase" ? (
          sentTo ? (
            <div className="rounded-lg bg-accent/10 p-5 text-primary">
              <p className="mb-1 flex items-center gap-2 font-semibold">
                <Mail className="h-5 w-5 text-accent" />
                Link enviado
              </p>
              <p className="text-sm">
                Enviamos um link de acesso para <strong>{sentTo}</strong>. Abra o e-mail neste aparelho para entrar.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="painel-email">E-mail</Label>
                <Input
                  id="painel-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nome@linsneves.adv.br"
                  aria-invalid={Boolean(error)}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={signIn.isPending}>
                {signIn.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar link de acesso
              </Button>
            </form>
          )
        ) : (
          <div className="space-y-6">
            <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              No site publicado, cada pessoa entra pelo link enviado ao e-mail. Nesta demonstração, escolha quem vai entrar.
            </p>
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">Sócios</h2>
              <p className="mb-3 text-sm text-muted-foreground">{ROLE_LABEL.revisor}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {partners.map((member) => (
                  <MemberButton key={member.email} member={member} busy={signIn.isPending} onPick={() => signIn.mutate(member.email)} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">Advogados</h2>
              <p className="mb-3 text-sm text-muted-foreground">{ROLE_LABEL.autor}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {authors.map((member) => (
                  <MemberButton key={member.email} member={member} busy={signIn.isPending} onPick={() => signIn.mutate(member.email)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelLogin;
