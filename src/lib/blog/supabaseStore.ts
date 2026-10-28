import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { BlogStore } from "./store";
import type { Member, Post, PostInput, PostStatus, Session } from "./types";
import { newId, slugify, uniqueSlug } from "./utils";

/** Linha da tabela public.posts (ver supabase/migrations). */
interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  area: string;
  cover_preset: number;
  cover_url: string | null;
  author_email: string | null;
  author_name: string;
  author_title: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const fromRow = (row: PostRow): Post => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  contentHtml: row.content_html,
  area: row.area,
  coverPreset: row.cover_preset,
  coverUrl: row.cover_url,
  authorEmail: row.author_email,
  authorName: row.author_name,
  authorTitle: row.author_title,
  status: row.status,
  publishedAt: row.published_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toRow = (input: PostInput, slug: string) => ({
  slug,
  title: input.title,
  excerpt: input.excerpt,
  content_html: input.contentHtml,
  area: input.area,
  cover_preset: input.coverPreset,
  cover_url: input.coverUrl,
  author_email: input.authorEmail,
  author_name: input.authorName,
  author_title: input.authorTitle,
  status: input.status,
  published_at: input.publishedAt,
});

const COVER_BUCKET = "blog";

let clientPromise: Promise<SupabaseClient> | null = null;

/** Carrega o cliente do Supabase só quando o blog precisa dele. */
const getClient = () => {
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" },
    }),
  );
  return clientPromise;
};

const fail = (message: string, error: { message: string } | null) => {
  if (error) throw new Error(`${message} (${error.message})`);
};

export const createSupabaseStore = (): BlogStore => ({
  mode: "supabase",

  async listPublished() {
    const db = await getClient();
    const { data, error } = await db
      .from("posts")
      .select("*")
      .eq("status", "publicado")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });
    fail("Não foi possível carregar os artigos", error);
    return (data as PostRow[]).map(fromRow);
  },

  async getPublishedBySlug(slug) {
    const db = await getClient();
    const { data, error } = await db
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "publicado")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    fail("Não foi possível carregar o artigo", error);
    return data ? fromRow(data as PostRow) : null;
  },

  async listAll() {
    const db = await getClient();
    const { data, error } = await db.from("posts").select("*").order("updated_at", { ascending: false });
    fail("Não foi possível carregar os artigos do painel", error);
    return (data as PostRow[]).map(fromRow);
  },

  async getById(id) {
    const db = await getClient();
    const { data, error } = await db.from("posts").select("*").eq("id", id).maybeSingle();
    fail("Não foi possível abrir o artigo", error);
    return data ? fromRow(data as PostRow) : null;
  },

  async save(input) {
    const db = await getClient();
    const base = slugify(input.slug || input.title) || "artigo";
    const { data: similar, error: slugError } = await db.from("posts").select("id, slug").like("slug", `${base}%`);
    fail("Não foi possível conferir o endereço do artigo", slugError);
    const taken = ((similar ?? []) as { id: string; slug: string }[])
      .filter((row) => row.id !== input.id)
      .map((row) => row.slug);
    const row = toRow(input, uniqueSlug(base, taken));

    const query = input.id
      ? db.from("posts").update(row).eq("id", input.id).select("*").single()
      : db.from("posts").insert(row).select("*").single();
    const { data, error } = await query;
    fail("Não foi possível salvar o artigo", error);
    return fromRow(data as PostRow);
  },

  async remove(id) {
    const db = await getClient();
    const { error } = await db.from("posts").delete().eq("id", id);
    fail("Não foi possível excluir o artigo", error);
  },

  async uploadCover(image) {
    const db = await getClient();
    const path = `capas/${newId()}.jpg`;
    const { error } = await db.storage.from(COVER_BUCKET).upload(path, image, { contentType: "image/jpeg" });
    fail("Não foi possível enviar a imagem", error);
    return db.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl;
  },

  async listMembers() {
    const db = await getClient();
    const { data, error } = await db.from("blog_members").select("email, name, title, role").order("name");
    fail("Não foi possível carregar a equipe", error);
    return (data ?? []) as Member[];
  },

  async getSession(): Promise<Session | null> {
    const db = await getClient();
    const { data } = await db.auth.getSession();
    const email = data.session?.user.email;
    if (!email) return null;
    const { data: member, error } = await db
      .from("blog_members")
      .select("email, name, title, role")
      .ilike("email", email)
      .maybeSingle();
    fail("Não foi possível conferir o acesso", error);
    return { email, member: (member as Member | null) ?? null };
  },

  async signIn(email) {
    const db = await getClient();
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/blog/painel`, shouldCreateUser: true },
    });
    fail("Não foi possível enviar o link de acesso", error);
    return "link-enviado";
  },

  async signOut() {
    const db = await getClient();
    await db.auth.signOut();
  },

  onAuthChange(callback) {
    let unsubscribe = () => {};
    getClient().then((db) => {
      const { data } = db.auth.onAuthStateChange(() => callback());
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => unsubscribe();
  },
});
