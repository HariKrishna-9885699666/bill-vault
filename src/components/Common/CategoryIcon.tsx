import { CATEGORY_MAP } from "@/utils/constants";
import type { CategoryType } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  category: CategoryType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-base",
  md: "h-10 w-10 text-lg",
  lg: "h-14 w-14 text-2xl",
};

export function CategoryIcon({ category, size = "md", className }: Props) {
  const meta = CATEGORY_MAP[category];
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl text-white shadow-sm",
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: `var(--${meta.token})` }}
      aria-label={meta.label}
    >
      <Icon />
    </div>
  );
}