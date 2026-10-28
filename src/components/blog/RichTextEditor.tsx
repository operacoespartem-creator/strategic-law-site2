import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { articleProseClass } from "@/components/blog/ArticleBody";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
}

const ToolButton = ({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-md text-primary transition-colors",
      "hover:bg-accent/10 hover:text-accent disabled:opacity-40 disabled:pointer-events-none",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      active && "bg-primary text-white hover:bg-primary hover:text-white",
    )}
  >
    {children}
  </button>
);

const LinkButton = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const apply = () => {
    const href = url.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const full = /^(https?:|mailto:)/i.test(href) ? href : `https://${href}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href: full }).run();
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setUrl(editor.getAttributes("link").href ?? "");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Link"
          aria-label="Link"
          onMouseDown={(event) => event.preventDefault()}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-accent/10 hover:text-accent",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            editor.isActive("link") && "bg-primary text-white hover:bg-primary hover:text-white",
          )}
        >
          <Link2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-3">
        <label htmlFor="editor-link-url" className="text-sm font-semibold text-primary">
          Endereço do link
        </label>
        <Input
          id="editor-link-url"
          value={url}
          placeholder="https://"
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          {editor.isActive("link") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setOpen(false);
              }}
            >
              Remover link
            </Button>
          )}
          <Button type="button" size="sm" onClick={apply}>
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Editor do artigo. Aceita texto colado do Word ou do Google Docs:
 * mantém negrito, itálico, títulos, listas, citações e links, e descarta o resto da formatação.
 */
const RichTextEditor = ({ value, onChange, invalid }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder: "Escreva aqui ou cole o texto do Word ou do Google Docs." }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(articleProseClass, "min-h-[420px] px-5 py-5 md:px-8 focus:outline-none"),
        "aria-label": "Texto do artigo",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? "" : current.getHTML()),
  });

  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML() && !(value === "" && editor.isEmpty)) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-[480px] rounded-lg border border-border bg-background" />;
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background shadow-sm focus-within:ring-2 focus-within:ring-accent/40",
        invalid ? "border-destructive" : "border-border",
      )}
    >
      <div className="sticky top-16 z-10 flex flex-wrap items-center gap-1 rounded-t-lg border-b border-border bg-background/95 px-2 py-1.5 backdrop-blur">
        <ToolButton label="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolButton>
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolButton
          label="Título de seção"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Subtítulo"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolButton>
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolButton label="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Citação" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolButton>
        <LinkButton editor={editor} />
        <span className="ml-auto flex items-center gap-1">
          <ToolButton label="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </ToolButton>
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
