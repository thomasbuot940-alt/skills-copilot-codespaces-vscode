import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-void px-6 text-center">
      <div>
        <p className="font-mono text-xs tracking-[0.3em] text-matrix">404 // SIGNAL PERDU</p>
        <h1 className="mt-3 font-mono text-3xl text-white">POWERTECH THE FUTURE</h1>
        <p className="mt-3 text-mute">Cette adresse ne fait pas partie du système.</p>
        <Link href="/" className="mt-6 inline-block border border-cyan/60 px-4 py-2 font-mono text-sm text-cyan">
          Retour au terminal
        </Link>
      </div>
    </main>
  );
}
