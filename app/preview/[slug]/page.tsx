import { notFound } from "next/navigation";
import { LivePreview } from "@/components/lab/LivePreview";
import { projectBySlug } from "@/data/projects";

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  return (
    <main className="min-h-screen bg-void p-4 text-ink sm:p-8">
      <p className="mb-4 font-mono text-[11px] tracking-[0.22em] text-matrix">LIVE PREVIEW // {project.title}</p>
      <LivePreview slug={slug} framed />
    </main>
  );
}
