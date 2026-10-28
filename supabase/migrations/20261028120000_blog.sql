-- Blog Lins Neves: artigos, equipe com acesso ao painel e imagens de capa.
-- Como aplicar: Supabase > SQL Editor > colar este arquivo > Run (ou: supabase db push).

-- Quem pode entrar no painel ------------------------------------------------
create table if not exists public.blog_members (
  email text primary key check (email = lower(email)),
  name text not null,
  title text not null default '',
  role text not null default 'autor' check (role in ('autor', 'revisor', 'admin')),
  created_at timestamptz not null default now()
);

comment on table public.blog_members is
  'Equipe com acesso ao painel do blog. autor: envia para revisão. revisor: publica. admin: publica e gerencia a equipe.';

-- Papel de quem está logado (null quando o e-mail não está cadastrado)
create or replace function public.blog_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.blog_members
  where email = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create or replace function public.blog_is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.blog_role() in ('revisor', 'admin'), false)
$$;

alter table public.blog_members enable row level security;

create policy "equipe ve a equipe" on public.blog_members
  for select to authenticated
  using (public.blog_role() is not null);

create policy "admin gerencia a equipe" on public.blog_members
  for all to authenticated
  using (public.blog_role() = 'admin')
  with check (public.blog_role() = 'admin');

-- Artigos --------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null default '',
  content_html text not null default '',
  area text not null default '',
  cover_preset smallint not null default 0 check (cover_preset between 0 and 3),
  cover_url text,
  author_email text,
  author_name text not null,
  author_title text,
  status text not null default 'rascunho' check (status in ('rascunho', 'revisao', 'publicado')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publicado_tem_data check (status <> 'publicado' or published_at is not null)
);

create index if not exists posts_publicados_idx
  on public.posts (published_at desc)
  where status = 'publicado';

create or replace function public.posts_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.posts_touch_updated_at();

alter table public.posts enable row level security;

-- Visitantes do site: só artigos publicados cuja data já chegou (agendados ficam ocultos)
create policy "visitantes leem publicados" on public.posts
  for select to anon, authenticated
  using (status = 'publicado' and published_at <= now());

-- Equipe do painel: vê todos os artigos
create policy "equipe le todos" on public.posts
  for select to authenticated
  using (public.blog_role() is not null);

-- Autores criam em nome próprio, só como rascunho ou revisão. Revisores criam qualquer artigo.
create policy "equipe cria artigos" on public.posts
  for insert to authenticated
  with check (
    public.blog_is_reviewer()
    or (
      public.blog_role() = 'autor'
      and author_email = lower(auth.jwt() ->> 'email')
      and status in ('rascunho', 'revisao')
    )
  );

-- Autores editam os próprios artigos que ainda não foram publicados. Revisores editam todos.
create policy "equipe edita artigos" on public.posts
  for update to authenticated
  using (
    public.blog_is_reviewer()
    or (
      public.blog_role() = 'autor'
      and author_email = lower(auth.jwt() ->> 'email')
      and status <> 'publicado'
    )
  )
  with check (
    public.blog_is_reviewer()
    or (
      public.blog_role() = 'autor'
      and author_email = lower(auth.jwt() ->> 'email')
      and status in ('rascunho', 'revisao')
    )
  );

-- Excluir: revisores, ou o próprio autor enquanto o artigo não foi publicado
create policy "equipe exclui artigos" on public.posts
  for delete to authenticated
  using (
    public.blog_is_reviewer()
    or (
      public.blog_role() = 'autor'
      and author_email = lower(auth.jwt() ->> 'email')
      and status <> 'publicado'
    )
  );

-- Imagens de capa --------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do nothing;

create policy "capas sao publicas" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'blog');

create policy "equipe envia capas" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'blog' and public.blog_role() is not null);

create policy "revisores apagam capas" on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog' and public.blog_is_reviewer());

-- Os 3 artigos que já estavam na página inicial ----------------------------------
insert into public.posts
  (slug, title, excerpt, content_html, area, cover_preset, author_name, author_title, status, published_at)
values
  ('o-futuro-das-concessoes-e-ppps-no-brasil', 'O Futuro das Concessões e PPPs no Brasil', 'Análise das novas oportunidades de parcerias público-privadas e modelagens inovadoras para infraestrutura.', '<p>O cenário das concessões e Parcerias Público-Privadas (PPPs) no Brasil atravessa um momento de transformação significativa. Com a crescente demanda por investimentos em infraestrutura e a limitação de recursos públicos, essas modalidades contratuais se tornam cada vez mais estratégicas para o desenvolvimento nacional.</p><p>A reforma do marco legal das concessões, aliada às experiências acumuladas nas últimas décadas, abre novas perspectivas para projetos mais eficientes e sustentáveis. Destacam-se as modelagens inovadoras que incorporam indicadores de desempenho mais sofisticados, mecanismos de reequilíbrio econômico-financeiro mais transparentes e estruturas de garantias mais robustas.</p><p>No âmbito municipal e estadual, observa-se um crescimento expressivo de PPPs voltadas para iluminação pública, saneamento básico e mobilidade urbana. Esses projetos demonstram a maturidade do mercado brasileiro e a capacidade de adaptação dos modelos contratuais às especificidades locais.</p><p>O desafio que se apresenta para o futuro é consolidar um ambiente regulatório estável e previsível, que estimule investimentos de longo prazo e promova a competitividade nos processos licitatórios. A segurança jurídica permanece como elemento central para atrair investidores nacionais e internacionais.</p>', 'Direito Administrativo', 0, 'Lins Neves Advocacia', 'Equipe Lins Neves', 'publicado', '2024-03-18T12:00:00.000Z'),
  ('impacto-da-reforma-tributaria-em-fusoes-e-aquisicoes', 'Impacto da Reforma Tributária em Fusões e Aquisições', 'Como as mudanças tributárias estão transformando o mercado de M&A e as estratégias das empresas.', '<p>A Reforma Tributária aprovada recentemente representa uma mudança paradigmática no sistema tributário brasileiro, com impactos profundos nas operações de fusões e aquisições (M&amp;A). A transição para o modelo de Imposto sobre Valor Agregado (IVA) dual demanda uma reavaliação completa das estratégias corporativas.</p><p>No contexto das transações de M&amp;A, a reforma traz implicações significativas para a avaliação de empresas-alvo. Os créditos tributários acumulados, as contingências fiscais e os benefícios fiscais estaduais passam por uma releitura à luz do novo regime. Due diligences tributárias tornam-se ainda mais complexas e estratégicas.</p><p>A simplificação do sistema, embora benéfica no longo prazo, cria desafios durante o período de transição. Empresas em processo de reestruturação precisam considerar os impactos tanto do regime atual quanto do futuro sistema, o que demanda planejamento tributário sofisticado e assessoria jurídica especializada.</p><p>Setores como varejo, serviços e indústria enfrentam cenários distintos, exigindo análises customizadas para cada operação. A nova sistemática de não-cumulatividade plena e a extinção gradual de benefícios fiscais regionais redesenham o mapa competitivo brasileiro.</p><p>Para investidores e empresas, o momento atual exige uma abordagem proativa e estratégica, antecipando os efeitos da reforma e estruturando operações que maximizem valor no novo ambiente tributário.</p>', 'Direito Empresarial', 1, 'Lins Neves Advocacia', 'Equipe Lins Neves', 'publicado', '2025-10-15T12:00:00.000Z'),
  ('smart-cities-o-papel-do-direito-na-inovacao-urbana', 'Smart Cities: O Papel do Direito na Inovação Urbana', 'Aspectos jurídicos e regulatórios da implementação de tecnologias inteligentes nas cidades brasileiras.', '<p>O conceito de Smart Cities ou Cidades Inteligentes representa uma evolução significativa na forma como pensamos o desenvolvimento urbano. A integração de tecnologias de informação e comunicação (TICs) na gestão urbana traz consigo um conjunto complexo de questões jurídicas que demandam atenção especializada.</p><p>No Brasil, iniciativas de cidades inteligentes multiplicam-se em municípios de diferentes portes, abrangendo desde sistemas de iluminação pública inteligente até plataformas integradas de mobilidade urbana. Cada uma dessas iniciativas levanta questões sobre licitações, contratos administrativos, proteção de dados e regulação setorial.</p><p>A Lei Geral de Proteção de Dados (LGPD) assume papel central nesse contexto. A coleta massiva de dados urbanos, essencial para o funcionamento de sistemas inteligentes, deve observar rigorosamente os princípios de finalidade, adequação e necessidade. O poder público, como controlador de dados, precisa implementar programas de governança robustos.</p><p>As PPPs e concessões surgem como instrumentos privilegiados para viabilizar projetos de Smart Cities, permitindo a mobilização de expertise privada e investimentos de longo prazo. A modelagem desses contratos deve contemplar a rápida evolução tecnológica e garantir flexibilidade para incorporação de inovações.</p><p>O futuro das cidades brasileiras passa necessariamente pela integração entre tecnologia, planejamento urbano e direito. O desafio é construir marcos regulatórios que estimulem a inovação sem comprometer direitos fundamentais dos cidadãos.</p>', 'Direito Urbanístico', 2, 'Lins Neves Advocacia', 'Equipe Lins Neves', 'publicado', '2024-07-22T12:00:00.000Z')
on conflict (slug) do nothing;

-- Equipe com acesso: ajuste a lista antes de rodar (ou cadastre depois pelo Table Editor).
-- insert into public.blog_members (email, name, title, role) values
--   ('estevan@linsneves.adv.br', 'Estevan De Barros Lins', 'Sócio Fundador', 'admin'),
--   ('arthurneves@linsneves.adv.br', 'Arthur Rodrigues da Costa Neves', 'Sócio', 'revisor'),
--   ('marcospecht@linsneves.adv.br', 'Marco Belém Specht', 'Advogado', 'autor');
