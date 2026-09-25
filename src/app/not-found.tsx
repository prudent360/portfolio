import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="font-mono text-sm uppercase tracking-[2px] text-accent">404</p>
      <h1 className="font-display text-4xl font-semibold">Page not found</h1>
      <Link href="/" className="flex h-12 items-center rounded-lg bg-accent px-7 font-semibold text-white hover:bg-accent-dark">Back home</Link>
    </div>
  );
}
