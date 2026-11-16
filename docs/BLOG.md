# Blog do site Lins Neves

O blog fica em `/blog`, cada artigo em `/blog/endereco-do-artigo` e o painel de publicação em `/blog/painel`.
A seção "Insights" da página inicial mostra sozinha os 3 artigos mais recentes.

## Como a equipe publica

1. Entra em `linsneves.com.br/blog/painel` com o login único do blog (e-mail e senha da conta do painel).
2. Clica em **Novo artigo**, escreve ou cola o texto do Word ou do Google Docs.
3. Preenche título, resumo, área, a **Assinatura** (nome e cargo de quem escreveu, que aparece no fim do artigo) e escolhe uma capa pronta ou envia uma imagem.
4. Confere a aba **Prévia** e a prévia do WhatsApp na lateral.
5. Publica, ou agenda para uma data e hora.

### Login único

O painel usa uma conta só para a equipe toda (`blog@linsneves.adv.br`, ajustável em `src/lib/blog/config.ts`).
Quem é o responsável por cada artigo fica registrado no campo **Assinatura**.

A estrutura de perfis (`autor`, `revisor`, `admin`) continua no banco, caso o escritório queira logins individuais no futuro.
A conta única é cadastrada como `admin`, que publica direto.

## Modo demonstração

Sem as variáveis do Supabase, o blog funciona em modo demonstração: os 3 artigos iniciais aparecem,
e o painel deixa escolher quem entra. O que for criado fica salvo só no navegador de quem testou.
Serve para mostrar o fluxo antes de ligar o banco.

## Ligar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (região São Paulo).
2. Em **SQL Editor**, rode `supabase/migrations/20261028120000_blog.sql` e depois `20261116190000_blog_permissoes.sql`.
   Isso cria as tabelas `posts` e `blog_members`, as regras de acesso, o espaço das capas e os 3 artigos atuais.
3. Crie o login do painel em **Authentication > Users > Add user** (e-mail e senha, com "Auto Confirm User").
   Cadastre o mesmo e-mail na tabela `blog_members` com `role = 'admin'`:
   `insert into public.blog_members (email, name, title, role) values ('blog@linsneves.adv.br', 'Equipe Lins Neves', 'Painel do blog', 'admin');`
   Em **Authentication > Sign In / Providers**, desligue "Allow new users to sign up".
4. Copie a **Project URL** e a chave **anon public** (Project Settings > API) para as variáveis
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` da hospedagem (Vercel: Settings > Environment Variables).
   Em desenvolvimento, copie `.env.example` para `.env.local`.

A chave `anon` pode ficar no site: ela é pública por definição. Quem protege os dados são as regras da migração.
Visitantes só leem artigos publicados. Só o login cadastrado entra no painel.

## Hospedagem na Vercel

O `vercel.json` manda todos os endereços (como `/blog/nome-do-artigo`) para o site. Sem ele, abrir um artigo direto pelo link daria erro 404.

## Arquivos

| Arquivo | O que faz |
| --- | --- |
| `src/lib/blog/config.ts` | Áreas do blog, número do WhatsApp, equipe do modo demonstração |
| `src/lib/blog/store.ts` | Escolhe entre Supabase e demonstração |
| `src/lib/blog/supabaseStore.ts` | Leitura e gravação no Supabase |
| `src/lib/blog/demoStore.ts` | Modo demonstração |
| `src/lib/blog/seed.ts` | Os 3 artigos que estavam na página inicial |
| `src/pages/BlogPage.tsx` | Lista de artigos com filtro por área e busca |
| `src/pages/ArticlePage.tsx` | Página do artigo |
| `src/pages/painel/` | Login, lista de artigos e editor |
| `src/components/blog/` | Card, capa, editor de texto, botões de compartilhar |

## Ainda falta

- **Prévia de cada artigo no WhatsApp e no LinkedIn.** Hoje todo link mostra a prévia geral do site,
  porque o site é montado no navegador. Para cada artigo ter capa e título próprios na prévia, é preciso
  hospedar na Vercel com uma função que entrega as meta tags do artigo para os robôs dessas redes.
- **Aviso por e-mail** quando um artigo entra em revisão (função do Supabase ou serviço de e-mail).
