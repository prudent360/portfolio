import Image from "next/image";

/** Company, school or issuer logo; falls back to the first letter of the name. */
export function OrgLogo({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      <span className="relative flex size-12 shrink-0 overflow-hidden rounded-lg border border-edge bg-white">
        <Image src={src} alt="" fill sizes="48px" className="object-contain p-1.5" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-display text-lg font-semibold text-accent">
      {name.trim().charAt(0).toUpperCase() || "·"}
    </span>
  );
}
