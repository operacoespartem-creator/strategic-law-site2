import { BLOG_MODE } from "./config";
import { createDemoStore } from "./demoStore";
import { createSupabaseStore } from "./supabaseStore";
import type { Member, Post, PostInput, Session } from "./types";

/**
 * Tudo o que o blog precisa do armazenamento.
 * Há duas implementações com a mesma interface: Supabase (produção) e demonstração (navegador).
 */
export interface BlogStore {
  mode: "supabase" | "demo";
  /** Artigos no ar, do mais recente para o mais antigo. */
  listPublished(): Promise<Post[]>;
  getPublishedBySlug(slug: string): Promise<Post | null>;
  /** Todos os artigos, para o painel. */
  listAll(): Promise<Post[]>;
  getById(id: string): Promise<Post | null>;
  save(input: PostInput): Promise<Post>;
  remove(id: string): Promise<void>;
  /** Envia a imagem de capa e devolve o endereço público. */
  uploadCover(image: Blob): Promise<string>;
  listMembers(): Promise<Member[]>;

  getSession(): Promise<Session | null>;
  /** Entra com o login único do painel (e-mail e senha). */
  signIn(email: string, password: string): Promise<"conectado">;
  signOut(): Promise<void>;
  onAuthChange(callback: () => void): () => void;
  /** Só no modo demonstração: volta aos artigos iniciais. */
  reset?(): Promise<void>;
}

export const blogStore: BlogStore = BLOG_MODE === "supabase" ? createSupabaseStore() : createDemoStore();
