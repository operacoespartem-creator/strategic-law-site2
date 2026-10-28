import { cn } from "@/lib/utils";
import { initials } from "@/lib/blog/utils";
import { FIRM_AUTHOR } from "@/lib/blog/config";

interface AuthorAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-16 h-16 text-lg",
};

const AuthorAvatar = ({ name, size = "sm", tone = "light", className }: AuthorAvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide",
      tone === "light" ? "bg-accent/10 text-accent" : "bg-white/15 text-white",
      sizes[size],
      className,
    )}
  >
    {name === FIRM_AUTHOR.name ? "LN" : initials(name)}
  </span>
);

export default AuthorAvatar;
