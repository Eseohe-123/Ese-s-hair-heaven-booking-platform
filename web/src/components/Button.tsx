import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "dark" | "outline";

const styles: Record<Variant, string> = {
  primary:
    "bg-blush-500 text-white shadow-[0_8px_20px_rgba(244,114,160,0.45)] hover:bg-blush-600",
  secondary: "bg-white text-plum-700 border-2 border-white hover:bg-blush-50",
  dark: "bg-plum-700 text-white hover:bg-plum-900",
  outline:
    "bg-white text-plum-700 border-2 border-blush-100 hover:border-blush-500",
};

export function Button({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-extrabold transition-colors ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}
