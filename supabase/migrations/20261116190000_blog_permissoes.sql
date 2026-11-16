-- Permissões do blog e ajustes apontados pelo verificador de segurança do Supabase.
-- Necessário em projetos que não liberam tabelas novas automaticamente para a API.
-- As regras de acesso (RLS) continuam decidindo quais linhas cada um vê.

grant usage on schema public to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.blog_members to authenticated;

alter function public.posts_touch_updated_at() set search_path = '';
revoke execute on function public.blog_role() from public, anon;
revoke execute on function public.blog_is_reviewer() from public, anon;
grant execute on function public.blog_role() to authenticated;
grant execute on function public.blog_is_reviewer() to authenticated;
