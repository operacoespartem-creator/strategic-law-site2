import DOMPurify from "dompurify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SITE_URL } from "./config";
import type { Post } from "./types";

export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

/** Garante um endereço único acrescentando -2, -3... quando já existe. */
export const uniqueSlug = (base: string, taken: string[]) => {
  const root = base || "artigo";
  if (!taken.includes(root)) return root;
  let n = 2;
  while (taken.includes(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
};

export const htmlToText = (html: string) => {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, " ");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent ?? "";
};

export const readingMinutes = (html: string) => {
  const words = htmlToText(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export const formatDate = (iso: string | null, pattern = "d 'de' MMMM 'de' yyyy") =>
  iso ? format(new Date(iso), pattern, { locale: ptBR }) : "";

export const formatDateTime = (iso: string | null) =>
  iso ? format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "";

const CONNECTORS = ["de", "da", "do", "dos", "das", "e"];

/** Iniciais do primeiro e do último nome: "Estevan De Barros Lins" vira "EL". */
export const initials = (name: string) => {
  const parts = name
    .split(/\s+/)
    .filter((part) => part && !CONNECTORS.includes(part.toLowerCase()) && !/^[A-Za-z]\.$/.test(part));
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const postUrl = (post: Pick<Post, "slug">) => `${SITE_URL}/blog/${post.slug}`;

const ALLOWED_TAGS = ["p", "br", "h2", "h3", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "a", "hr", "code"];

export const sanitizeHtml = (html: string) =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ["href", "target", "rel"] });

/** Converte texto com linhas em branco entre parágrafos em HTML simples. */
export const paragraphsToHtml = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`)
    .join("");

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** Reduz a imagem de capa antes de salvar: no máximo 1600 px de largura, JPEG. */
export const prepareCoverImage = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível ler a imagem."))), "image/jpeg", 0.85),
  );
};

export const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(blob);
  });
