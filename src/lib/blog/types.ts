export type PostStatus = "rascunho" | "revisao" | "publicado";

export type MemberRole = "autor" | "revisor" | "admin";

/** Pessoa com acesso ao painel do blog. */
export interface Member {
  email: string;
  name: string;
  /** Cargo exibido no artigo, por exemplo "Sócio Fundador". */
  title: string;
  role: MemberRole;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  /** Resumo curto: aparece no Google, no WhatsApp e nos cards. */
  excerpt: string;
  contentHtml: string;
  area: string;
  /** Capa gerada na identidade visual (0 a 3), usada quando não há imagem enviada. */
  coverPreset: number;
  coverUrl: string | null;
  authorEmail: string | null;
  authorName: string;
  authorTitle: string | null;
  status: PostStatus;
  /** Data de publicação. No futuro, o artigo fica agendado. */
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PostInput = Omit<Post, "id" | "createdAt" | "updatedAt"> & { id?: string };

export interface Session {
  email: string;
  /** null quando o e-mail entrou, mas não está cadastrado no painel. */
  member: Member | null;
}

export const isLive = (post: Post, now = Date.now()) =>
  post.status === "publicado" && !!post.publishedAt && Date.parse(post.publishedAt) <= now;

export const isScheduled = (post: Post, now = Date.now()) =>
  post.status === "publicado" && !!post.publishedAt && Date.parse(post.publishedAt) > now;

export const canPublish = (member: Member | null | undefined) =>
  member?.role === "revisor" || member?.role === "admin";
