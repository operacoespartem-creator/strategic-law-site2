import { Linkedin, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const btn =
  "inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-primary " +
  "hover:border-accent hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const ShareButtons = ({ title, url }: { title: string; url: string }) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar. Copie o endereço: " + url);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-muted-foreground mr-1">Compartilhar</span>
      <a
        className={btn}
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </a>
      <a
        className={btn}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Linkedin className="w-4 h-4" />
        LinkedIn
      </a>
      <button type="button" className={btn} onClick={copy}>
        <Link2 className="w-4 h-4" />
        Copiar link
      </button>
    </div>
  );
};

export default ShareButtons;
