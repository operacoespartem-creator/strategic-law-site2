import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import logoAzul from "@/assets/logo-lins-neves-azul.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="max-w-md text-center">
        <img src={logoAzul} alt="Lins Neves Advocacia" className="mx-auto mb-10 h-12 w-auto" />
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-accent">Erro 404</p>
        <h1 className="mb-4 text-3xl font-bold text-primary">Página não encontrada</h1>
        <p className="mb-8 text-muted-foreground">O endereço pode ter mudado ou a página não existe mais.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-md bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary/90">
            Ir para o início
          </Link>
          <Link to="/blog" className="rounded-md border border-border bg-background px-5 py-2.5 font-semibold text-primary hover:border-accent hover:text-accent">
            Ver o blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
