import { isScheduled, type MemberRole, type Post } from "@/lib/blog/types";
import { formatDateTime } from "@/lib/blog/utils";

export type StatusKey = "publicado" | "agendado" | "revisao" | "rascunho";

export const statusKey = (post: Post): StatusKey => {
  if (post.status === "publicado") return isScheduled(post) ? "agendado" : "publicado";
  return post.status;
};

export const STATUS_LABEL: Record<StatusKey, string> = {
  publicado: "Publicado",
  agendado: "Agendado",
  revisao: "Em revisão",
  rascunho: "Rascunho",
};

export const STATUS_CLASS: Record<StatusKey, string> = {
  publicado: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  agendado: "bg-amber-50 text-amber-800 ring-amber-600/25",
  revisao: "bg-sky-50 text-sky-800 ring-sky-600/20",
  rascunho: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export const statusDate = (post: Post) => {
  const key = statusKey(post);
  if (key === "publicado") return `Publicado em ${formatDateTime(post.publishedAt)}`;
  if (key === "agendado") return `Agendado para ${formatDateTime(post.publishedAt)}`;
  return `Editado em ${formatDateTime(post.updatedAt)}`;
};

export const ROLE_LABEL: Record<MemberRole, string> = {
  revisor: "Revisa e publica",
  admin: "Administrador",
  autor: "Envia para revisão",
};
