import { useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSession } from "@/hooks/useBlog";
import type { Member } from "@/lib/blog/types";
import PainelDashboard from "./PainelDashboard";
import PainelEditor from "./PainelEditor";
import PainelLayout from "./PainelLayout";
import PainelLogin from "./PainelLogin";

/** Remonta o editor ao trocar de artigo, para não levar o rascunho de um para o outro. */
const EditorRoute = ({ member }: { member: Member }) => {
  const { id } = useParams();
  return <PainelEditor key={id ?? "novo"} member={member} />;
};

/** Painel do blog em /blog/painel: login, lista de artigos e editor. */
const PainelPage = () => {
  const { data: session, isLoading } = useSession();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Painel do blog | Lins Neves Advocacia";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Carregando" />
      </div>
    );
  }

  const member = session?.member;

  return (
    <PainelLayout session={session ?? null}>
      {!member ? (
        <PainelLogin session={session ?? null} />
      ) : (
        <Routes>
          <Route index element={<PainelDashboard member={member} />} />
          <Route path="novo" element={<EditorRoute member={member} />} />
          <Route path="editar/:id" element={<EditorRoute member={member} />} />
          <Route path="*" element={<PainelDashboard member={member} />} />
        </Routes>
      )}
    </PainelLayout>
  );
};

export default PainelPage;
