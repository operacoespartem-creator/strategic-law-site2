import { FIRM_AUTHOR } from "./config";
import type { Post } from "./types";
import { paragraphsToHtml } from "./utils";

/** Os 3 artigos que já estavam na seção Insights da página inicial. */
const SEED_ARTICLES = [
  {
    "slug": "o-futuro-das-concessoes-e-ppps-no-brasil",
    "title": "O Futuro das Concessões e PPPs no Brasil",
    "excerpt": "Análise das novas oportunidades de parcerias público-privadas e modelagens inovadoras para infraestrutura.",
    "area": "Direito Administrativo",
    "publishedAt": "2024-03-18T12:00:00.000Z",
    "text": "O cenário das concessões e Parcerias Público-Privadas (PPPs) no Brasil atravessa um momento de transformação significativa. Com a crescente demanda por investimentos em infraestrutura e a limitação de recursos públicos, essas modalidades contratuais se tornam cada vez mais estratégicas para o desenvolvimento nacional.\n\nA reforma do marco legal das concessões, aliada às experiências acumuladas nas últimas décadas, abre novas perspectivas para projetos mais eficientes e sustentáveis. Destacam-se as modelagens inovadoras que incorporam indicadores de desempenho mais sofisticados, mecanismos de reequilíbrio econômico-financeiro mais transparentes e estruturas de garantias mais robustas.\n\nNo âmbito municipal e estadual, observa-se um crescimento expressivo de PPPs voltadas para iluminação pública, saneamento básico e mobilidade urbana. Esses projetos demonstram a maturidade do mercado brasileiro e a capacidade de adaptação dos modelos contratuais às especificidades locais.\n\nO desafio que se apresenta para o futuro é consolidar um ambiente regulatório estável e previsível, que estimule investimentos de longo prazo e promova a competitividade nos processos licitatórios. A segurança jurídica permanece como elemento central para atrair investidores nacionais e internacionais.",
    "coverPreset": 0
  },
  {
    "slug": "impacto-da-reforma-tributaria-em-fusoes-e-aquisicoes",
    "title": "Impacto da Reforma Tributária em Fusões e Aquisições",
    "excerpt": "Como as mudanças tributárias estão transformando o mercado de M&A e as estratégias das empresas.",
    "area": "Direito Empresarial",
    "publishedAt": "2025-10-15T12:00:00.000Z",
    "text": "A Reforma Tributária aprovada recentemente representa uma mudança paradigmática no sistema tributário brasileiro, com impactos profundos nas operações de fusões e aquisições (M&A). A transição para o modelo de Imposto sobre Valor Agregado (IVA) dual demanda uma reavaliação completa das estratégias corporativas.\n\nNo contexto das transações de M&A, a reforma traz implicações significativas para a avaliação de empresas-alvo. Os créditos tributários acumulados, as contingências fiscais e os benefícios fiscais estaduais passam por uma releitura à luz do novo regime. Due diligences tributárias tornam-se ainda mais complexas e estratégicas.\n\nA simplificação do sistema, embora benéfica no longo prazo, cria desafios durante o período de transição. Empresas em processo de reestruturação precisam considerar os impactos tanto do regime atual quanto do futuro sistema, o que demanda planejamento tributário sofisticado e assessoria jurídica especializada.\n\nSetores como varejo, serviços e indústria enfrentam cenários distintos, exigindo análises customizadas para cada operação. A nova sistemática de não-cumulatividade plena e a extinção gradual de benefícios fiscais regionais redesenham o mapa competitivo brasileiro.\n\nPara investidores e empresas, o momento atual exige uma abordagem proativa e estratégica, antecipando os efeitos da reforma e estruturando operações que maximizem valor no novo ambiente tributário.",
    "coverPreset": 1
  },
  {
    "slug": "smart-cities-o-papel-do-direito-na-inovacao-urbana",
    "title": "Smart Cities: O Papel do Direito na Inovação Urbana",
    "excerpt": "Aspectos jurídicos e regulatórios da implementação de tecnologias inteligentes nas cidades brasileiras.",
    "area": "Direito Urbanístico",
    "publishedAt": "2024-07-22T12:00:00.000Z",
    "text": "O conceito de Smart Cities ou Cidades Inteligentes representa uma evolução significativa na forma como pensamos o desenvolvimento urbano. A integração de tecnologias de informação e comunicação (TICs) na gestão urbana traz consigo um conjunto complexo de questões jurídicas que demandam atenção especializada.\n\nNo Brasil, iniciativas de cidades inteligentes multiplicam-se em municípios de diferentes portes, abrangendo desde sistemas de iluminação pública inteligente até plataformas integradas de mobilidade urbana. Cada uma dessas iniciativas levanta questões sobre licitações, contratos administrativos, proteção de dados e regulação setorial.\n\nA Lei Geral de Proteção de Dados (LGPD) assume papel central nesse contexto. A coleta massiva de dados urbanos, essencial para o funcionamento de sistemas inteligentes, deve observar rigorosamente os princípios de finalidade, adequação e necessidade. O poder público, como controlador de dados, precisa implementar programas de governança robustos.\n\nAs PPPs e concessões surgem como instrumentos privilegiados para viabilizar projetos de Smart Cities, permitindo a mobilização de expertise privada e investimentos de longo prazo. A modelagem desses contratos deve contemplar a rápida evolução tecnológica e garantir flexibilidade para incorporação de inovações.\n\nO futuro das cidades brasileiras passa necessariamente pela integração entre tecnologia, planejamento urbano e direito. O desafio é construir marcos regulatórios que estimulem a inovação sem comprometer direitos fundamentais dos cidadãos.",
    "coverPreset": 2
  }
] as const;

export const seedPosts = (): Post[] =>
  SEED_ARTICLES.map((article, index) => ({
    id: `seed-${index + 1}`,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    contentHtml: paragraphsToHtml(article.text),
    area: article.area,
    coverPreset: article.coverPreset,
    coverUrl: null,
    authorEmail: null,
    authorName: FIRM_AUTHOR.name,
    authorTitle: FIRM_AUTHOR.title,
    status: "publicado",
    publishedAt: article.publishedAt,
    createdAt: article.publishedAt,
    updatedAt: article.publishedAt,
  }));
