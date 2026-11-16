import type { Member } from "./types";

/** Endereço oficial do site, usado nos links de compartilhamento. */
export const SITE_URL = "https://linsneves.com.br";

export const WHATSAPP_NUMBER = "5581989443214";

/**
 * Supabase: com as duas variáveis preenchidas, o blog lê e grava no banco.
 * Sem elas, funciona em modo demonstração (dados salvos só no navegador).
 * A chave "anon" é pública por definição: quem protege os dados são as regras (RLS)
 * da migração em supabase/migrations.
 */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";
export const BLOG_MODE: "supabase" | "demo" = SUPABASE_URL && SUPABASE_ANON_KEY ? "supabase" : "demo";

/** Áreas que aparecem no filtro do blog e no editor. Ajuste conforme o escritório definir. */
export const BLOG_AREAS = [
  "Direito Empresarial",
  "Direito Tributário",
  "Direito Societário",
  "Direito Trabalhista",
  "Direito Administrativo",
  "Direito Administrativo Sancionador",
  "Direito Urbanístico",
  "Contratos",
  "Compliance",
  "Fusões e Aquisições",
  "Concessões e PPPs",
  "Licitações",
  "Direito Regulatório",
];

/**
 * Login único do painel. No Supabase, crie esse usuário com senha em
 * Authentication > Users e cadastre o mesmo e-mail na tabela blog_members como "admin".
 */
export const BLOG_LOGIN_EMAIL = "blog@linsneves.adv.br";

/** Conta usada no modo demonstração. */
export const DEMO_ACCOUNT: Member = { email: BLOG_LOGIN_EMAIL, name: "Equipe Lins Neves", title: "Painel do blog", role: "admin" };

/** Sugestões para o campo Assinatura do editor: quem escreveu o artigo. */
export const SIGNATURE_SUGGESTIONS: Member[] = [
  { email: "estevan@linsneves.adv.br", name: "Estevan De Barros Lins", title: "Sócio Fundador", role: "revisor" },
  { email: "arthurneves@linsneves.adv.br", name: "Arthur Rodrigues da Costa Neves", title: "Sócio", role: "revisor" },
  { email: "carolinaaraujo@linsneves.adv.br", name: "Ana Carolina Cavalcante Araújo", title: "Head da Área Trabalhista", role: "autor" },
  { email: "angelika.souza@linsneves.adv.br", name: "Angélika Souza Veríssimo da Costa", title: "Head da Área Administrativa", role: "autor" },
  { email: "damariscavalcanti@linsneves.adv.br", name: "Damaris T. Cavalcanti Maciel", title: "Head da Área Cível e Contratual", role: "autor" },
  { email: "tiberioleite@linsneves.adv.br", name: "Tibério Almeida Leite", title: "Head da Área Societária, Imobiliário e Empresarial", role: "autor" },
  { email: "marcospecht@linsneves.adv.br", name: "Marco Belém Specht", title: "Advogado", role: "autor" },
  { email: "lailamarques@linsneves.adv.br", name: "Laila Marques", title: "Advogada", role: "autor" },
];

/** Autor usado nos artigos publicados em nome do escritório. */
export const FIRM_AUTHOR = { name: "Lins Neves Advocacia", title: "Equipe Lins Neves" };
