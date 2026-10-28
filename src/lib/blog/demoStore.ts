import { DEMO_MEMBERS } from "./config";
import { seedPosts } from "./seed";
import type { BlogStore } from "./store";
import { isLive, type Post, type PostInput, type Session } from "./types";
import { blobToDataUrl, newId, slugify, uniqueSlug } from "./utils";

/**
 * Modo demonstração: guarda os artigos no navegador de quem está testando.
 * Serve para ver o fluxo completo antes de ligar o Supabase.
 */
const STORAGE_KEY = "linsneves-blog-demo-v1";
const AUTH_EVENT = "linsneves-blog-demo-auth";

interface DemoState {
  posts: Post[];
  sessionEmail: string | null;
}

let memory: DemoState | null = null;

const freshState = (): DemoState => ({ posts: seedPosts(), sessionEmail: null });

const load = (): DemoState => {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memory = JSON.parse(raw) as DemoState;
      return memory;
    }
  } catch {
    // Navegador sem acesso ao armazenamento: segue só em memória.
  }
  memory = freshState();
  return memory;
};

const persist = (state: DemoState) => {
  memory = state;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sem espaço ou sem permissão: os dados continuam valendo até recarregar a página.
  }
};

const byNewest = (a: Post, b: Post) =>
  Date.parse(b.publishedAt ?? b.updatedAt) - Date.parse(a.publishedAt ?? a.updatedAt);

const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 120));

export const createDemoStore = (): BlogStore => ({
  mode: "demo",

  async listPublished() {
    return delay(load().posts.filter((post) => isLive(post)).sort(byNewest));
  },

  async getPublishedBySlug(slug) {
    return delay(load().posts.find((post) => post.slug === slug && isLive(post)) ?? null);
  },

  async listAll() {
    return delay(
      [...load().posts].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    );
  },

  async getById(id) {
    return delay(load().posts.find((post) => post.id === id) ?? null);
  },

  async save(input: PostInput) {
    const state = load();
    const now = new Date().toISOString();
    const existing = input.id ? state.posts.find((post) => post.id === input.id) : undefined;
    const taken = state.posts.filter((post) => post.id !== input.id).map((post) => post.slug);
    const slug = uniqueSlug(slugify(input.slug || input.title), taken);
    const post: Post = {
      ...input,
      id: existing?.id ?? newId(),
      slug,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const posts = existing
      ? state.posts.map((item) => (item.id === post.id ? post : item))
      : [post, ...state.posts];
    persist({ ...state, posts });
    return delay(post);
  },

  async remove(id) {
    const state = load();
    persist({ ...state, posts: state.posts.filter((post) => post.id !== id) });
    return delay(undefined);
  },

  async uploadCover(image) {
    return blobToDataUrl(image);
  },

  async listMembers() {
    return delay(DEMO_MEMBERS);
  },

  async getSession(): Promise<Session | null> {
    const email = load().sessionEmail;
    if (!email) return null;
    const member = DEMO_MEMBERS.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? null;
    return { email, member };
  },

  async signIn(email) {
    persist({ ...load(), sessionEmail: email });
    window.dispatchEvent(new Event(AUTH_EVENT));
    return "conectado";
  },

  async signOut() {
    persist({ ...load(), sessionEmail: null });
    window.dispatchEvent(new Event(AUTH_EVENT));
  },

  onAuthChange(callback) {
    window.addEventListener(AUTH_EVENT, callback);
    return () => window.removeEventListener(AUTH_EVENT, callback);
  },

  async reset() {
    persist({ ...freshState(), sessionEmail: load().sessionEmail });
  },
});
