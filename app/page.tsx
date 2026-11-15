import { SiteShell } from "@/components/SiteShell";

export default function Page() {
  return (
    <>
      <noscript>
        <article className="mx-auto max-w-3xl px-6 py-16 font-body text-ink">
          <h1>POWERTECH THE FUTURE</h1>
          <p>PYTHON ENGINEERING // AI, 3D & WEB SYSTEMS</p>
          <p>
            Thomas conçoit des scripts Python, des sites et des systèmes web avec assistant IA. Le parcours est 100 %
            écrit. Starter 149 €, Pro 397 € (ou 2x 209 €), Enterprise 797 €, maintenance 49 €/mois, TJM 350 €/jour.
          </p>
        </article>
      </noscript>
      <SiteShell />
    </>
  );
}
