import CoverArt from "@/components/blog/CoverArt";

interface LinkPreviewCardProps {
  title: string;
  excerpt: string;
  coverPreset: number;
  coverUrl: string | null;
}

/** Como o link do artigo aparece quando alguém envia no WhatsApp. */
const LinkPreviewCard = ({ title, excerpt, coverPreset, coverUrl }: LinkPreviewCardProps) => (
  <div className="rounded-xl bg-[#efeae2] p-3">
    <div className="ml-auto max-w-[300px] rounded-lg bg-[#d9fdd3] p-1 shadow-sm">
      <div className="overflow-hidden rounded-md bg-[#cdeec6]">
        <div className="aspect-[1200/630]">
          <CoverArt preset={coverPreset} imageUrl={coverUrl} />
        </div>
        <div className="px-2.5 py-2">
          <p className="text-[13px] font-semibold leading-snug text-[#111b21] line-clamp-2">
            {title || "Título do artigo"}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-[#54656f] line-clamp-2">
            {excerpt || "O resumo aparece aqui."}
          </p>
          <p className="mt-1 text-[11px] text-[#667781]">linsneves.com.br</p>
        </div>
      </div>
      <p className="px-1.5 pt-1 text-right text-[10px] text-[#667781]">agora</p>
    </div>
  </div>
);

export default LinkPreviewCard;
