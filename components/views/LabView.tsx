"use client";

import { useState } from "react";
import { ActivityGraph } from "@/components/lab/ActivityGraph";
import { ProjectModal } from "@/components/lab/ProjectModal";
import { DecryptText } from "@/components/fx/DecryptText";
import { TiltCard } from "@/components/fx/TiltCard";
import { LAB_STACK } from "@/data/activity";
import { FILTERS, PROJECTS, type Project, type ProjectCategory } from "@/data/projects";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

export function LabView() {
  const [filter, setFilter] = useState<"all" | ProjectCategory>("all");
  const [open, setOpen] = useState<Project | null>(null);
  const visible = PROJECTS.filter((project) => filter === "all" || project.category === filter);

  return (
    <section>
      <p className="font-mono text-[11px] tracking-[0.28em] text-cyan">LAB RECRUTEURS // GITHUB</p>
      <h1 className="mt-2 font-mono text-3xl text-white sm:text-4xl">
        <DecryptText text="Galerie & créations" />
      </h1>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-ink">
        Vitrine pour les startups et les équipes tech, en France et à l&apos;international. Le graphique est un signal illustratif du lab — remplaçable par l&apos;API GitHub. Les projets pointent vers du code réel du studio, ou vers la démo publique quand elle existe.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="border border-white/10 bg-black/40 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-matrix">SIGNAL D&apos;ACTIVITÉ DU LAB</p>
          <ActivityGraph />
        </div>
        <div className="border border-white/10 bg-black/40 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-cyan">RÉPARTITION DU LAB</p>
          <ul className="mt-3 space-y-2">
            {LAB_STACK.map((item) => (
              <li key={item.name}>
                <div className="flex justify-between font-mono text-[11px] text-mute">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="mt-1 h-1.5 bg-white/5">
                  <div className="h-full" style={{ width: `${item.value}%`, background: item.color }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setFilter(item.id);
              getAudioEngine().play("tab");
            }}
            className={`border px-3 py-1 font-mono text-[11px] tracking-[0.12em] ${filter === item.id ? "border-cyan text-cyan" : "border-white/15 text-mute"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {visible.map((project) => (
          <TiltCard key={project.slug}>
            <button
              type="button"
              className="w-full text-left"
              onClick={() => {
                getAudioEngine().play("click");
                setOpen(project);
              }}
            >
              <p className="font-mono text-[10px] tracking-[0.18em] text-magenta">{project.stack[0]} // {project.year}</p>
              <h2 className="mt-2 font-mono text-xl text-white">
                <DecryptText text={project.title} />
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink">{project.summary}</p>
              <p className="mt-3 font-mono text-[11px] text-cyan">Live Preview</p>
            </button>
          </TiltCard>
        ))}
      </div>
      {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
