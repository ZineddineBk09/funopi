import type { ComponentPropsWithoutRef, CSSProperties } from "react";

type BoredButtonProps = {
  size?: "large" | "small";
  label?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

const sizeMap: Record<NonNullable<BoredButtonProps["size"]>, string> = {
  large: "w-48 h-48 shadow-[0_25px_45px_rgba(0,0,0,0.45)]",
  small: "w-16 h-16 shadow-[0_12px_22px_rgba(0,0,0,0.35)]",
};

const triangleStyles: Record<
  NonNullable<BoredButtonProps["size"]>,
  CSSProperties
> = {
  large: {
    width: 0,
    height: 0,
    borderTop: "22px solid transparent",
    borderBottom: "22px solid transparent",
    borderLeft: "36px solid #fff6f0",
  },
  small: {
    width: 0,
    height: 0,
    borderTop: "10px solid transparent",
    borderBottom: "10px solid transparent",
    borderLeft: "15px solid #fff6f0",
  },
};

export default function BoredButton({
  size = "large",
  label,
  className,
  ...rest
}: BoredButtonProps) {
  const baseStyles =
    "group relative isolate inline-flex select-none items-center justify-center rounded-full text-white transition-transform duration-150 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd5d5]/60 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <button
      type="button"
      {...rest}
      aria-label={label ?? "Launch a random Funopi experience"}
      className={`${baseStyles} ${sizeMap[size]} ${className ?? ""}`}
    >
      <span className="absolute inset-[-10%] rounded-full bg-gradient-to-b from-[#ffd56a] via-[#ff8c3f] to-[#ff3f32] opacity-80 blur-[14px] transition duration-300 group-hover:opacity-95" />
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff6a4c] via-[#d4122f] to-[#5a030f]" />
      <span className="absolute inset-[4%] rounded-full bg-gradient-to-b from-[#ffefe4]/70 via-transparent to-transparent opacity-90" />
      <span className="absolute inset-[8%] rounded-full bg-gradient-to-t from-transparent via-transparent to-[#ffe9d9]/40 mix-blend-screen" />
      <span className="absolute inset-[3%] rounded-full bg-gradient-to-b from-[#ffbb99]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative flex h-1/2 w-1/2 items-center justify-center">
        <span
          aria-hidden="true"
          className="ml-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
          style={triangleStyles[size]}
        />
      </span>
    </button>
  );
}
