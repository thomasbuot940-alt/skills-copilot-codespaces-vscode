"use client";

import { useEffect } from "react";
import { LivePreview } from "@/components/lab/LivePreview";
import type { Project } from "@/data/projects";
import { highlight } from "@/lib/highlight";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

export function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
        data-dialog-open="true"
        className="max-h-[90vh] w-full max-w-4xl overflow-auto border border-cyan/50 bg-[#07080e] p-4 shadow-neon sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-matrix">{project.year} // {project.stack.join(" · ")}</p>
            <h2 id="project-title" className="mt-1 font-mono text-2xl text-white">{project.title}</h2>
          </div>
          <button type="button" className="border border-white/20 px-3 py-1 font-mono text-xs text-mute" onClick={onClose}>
            Fermer
          </button>
        </div>
        <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-ink">{project.summary}</p>
        <div className="mt-4">
          <LivePreview slug={project.slug} framed />
        </div>
        <div className="mt-4">
          <p className="mb-2 font-mono text-[10px] tracking-[0.18em] text-cyan">{project.code.filename}</p>
          <pre
            className="overflow-auto bg-black/70 p-3 font-mono text-[12px] leading-relaxed text-ink"
            dangerouslySetInnerHTML={{ __html: highlight(project.code.body) }}
          />
        </div>
        <p className="mt-3 font-mono text-[11px] text-mute">Fichier : {project.fileHint}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.github ? (
            <a className="border border-matrix/60 px-3 py-2 font-mono text-xs text-matrix" href={project.github} target="_blank" rel="noreferrer" onClick={() => getAudioEngine().play("click")}>
              GitHub
            </a>
          ) : (
            <span className="border border-white/15 px-3 py-2 font-mono text-xs text-mute">Dépôt privé // sur demande</span>
          )}
          {project.liveUrl && (
            <a className="border border-cyan/60 px-3 py-2 font-mono text-xs text-cyan" href={project.liveUrl} target="_blank" rel="noreferrer">
              Démo publique
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
