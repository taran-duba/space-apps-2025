"use client";

import React, { useMemo, useState } from "react";

/**
 * Clairify — Respiratory Diseases Affected by Air Quality (TSX)
 * -----------------------------------------------------------------
 * Strongly-typed React component listing diseases/conditions impacted by air pollution.
 * Tailwind palette: 0A0424, 18314F, 384E77, A4CCC1, C7E8F3
 */

// ===== Types =====
export type Pollutant = "PM2.5" | "PM10" | "O3" | "NO2" | "SO2" | "CO" | "Wildfire Smoke";
export type Group = "Infants" | "Children" | "Adults" | "Older Adults";

export interface Reference {
  label: string;
  url: string;
}

export interface Disease {
  name: string;
  summary: string;
  pollutants: Pollutant[];
  groups?: Group[];
  tags?: string[];
  references?: Reference[];
}

// Filters include an "All" option
type FilterPollutant = "All" | Pollutant;
type FilterGroup = "All" | Group;

// ===== Data =====
export const DISEASES: Readonly<Disease[]> = [
  {
    name: "Asthma (exacerbations)",
    summary:
      "Air pollutants can trigger bronchoconstriction and airway inflammation, increasing symptoms, rescue medication use, and ER visits.",
    pollutants: ["PM2.5", "O3", "NO2", "Wildfire Smoke"],
    groups: ["Children", "Adults"],
    tags: ["wheezing", "attacks", "hospital visits"],
    references: [
      { label: "CDC Asthma & Air Quality", url: "https://www.cdc.gov/asthma/index.html" },
      { label: "HEI — State of Global Air", url: "https://www.stateofglobalair.org/" }
    ]
  },
  {
    name: "COPD (exacerbations)",
    summary:
      "Fine particles and gases worsen airflow limitation, raising risk of exacerbations, hospitalizations, and mortality in COPD.",
    pollutants: ["PM2.5", "PM10", "NO2", "O3", "SO2", "Wildfire Smoke"],
    groups: ["Older Adults"],
    tags: ["chronic bronchitis", "emphysema", "exacerbation"],
    references: [
      { label: "WHO — Chronic Respiratory Diseases", url: "https://www.who.int/health-topics/chronic-respiratory-diseases" }
    ]
  },
  {
    name: "Acute lower respiratory infections (ALRI)",
    summary:
      "Pollution increases susceptibility to and severity of infections like pneumonia and bronchiolitis, especially in children.",
    pollutants: ["PM2.5", "NO2", "SO2", "Wildfire Smoke"],
    groups: ["Children"],
    tags: ["pneumonia", "bronchiolitis"],
    references: [
      { label: "WHO — Air Pollution", url: "https://www.who.int/health-topics/air-pollution" }
    ]
  },
  {
    name: "Bronchitis (acute/chronic)",
    summary:
      "Irritant gases and particles inflame bronchi, causing cough and mucus production; chronic exposure increases chronic bronchitis risk.",
    pollutants: ["PM2.5", "PM10", "NO2", "SO2", "O3"],
    groups: ["Older Adults"],
    tags: ["cough", "mucus", "irritation"],
    references: [
      { label: "EPA — Health Effects of Ozone/Particles", url: "https://www.epa.gov/ground-level-ozone-pollution/health-effects-ozone-pollution" }
    ]
  },
  {
    name: "Allergic rhinitis & airway hypersensitivity",
    summary:
      "Pollutants can amplify allergic airway responses and sensitization, worsening rhinitis and triggering asthma in susceptible people.",
    pollutants: ["NO2", "O3", "PM2.5"],
    groups: ["Children", "Adults"],
    tags: ["allergy", "sensitization"],
    references: [
      { label: "NIH — Air Pollution & Allergies", url: "https://www.niehs.nih.gov/health/topics/agents/air-pollution" }
    ]
  },
  {
    name: "Lung cancer (long‑term risk)",
    summary:
      "Long-term exposure to fine particles is associated with increased lung cancer incidence and mortality.",
    pollutants: ["PM2.5"],
    groups: ["Older Adults"],
    tags: ["chronic exposure", "incidence"],
    references: [
      { label: "WHO/IARC — Outdoor Air Pollution", url: "https://www.iarc.who.int/video/iarc-outdoor-air-pollution-a-leading-environmental-cause-of-cancer-deaths/" }
    ]
  },
  {
    name: "Idiopathic pulmonary fibrosis (IPF) — exacerbations",
    summary:
      "Short‑term rises in particles and ozone may precipitate acute worsening events in fibrotic lung disease.",
    pollutants: ["PM2.5", "O3"],
    groups: ["Older Adults"],
    tags: ["exacerbation", "hospitalization"],
    references: [
      { label: "NIH — IPF Overview", url: "https://www.nhlbi.nih.gov/health/idiopathic-pulmonary-fibrosis" }
    ]
  },
  {
    name: "Cystic fibrosis — pulmonary exacerbations",
    summary:
      "Air pollution exposure is linked to increased respiratory infections and exacerbations in CF populations.",
    pollutants: ["PM2.5", "NO2", "O3"],
    groups: ["Children", "Adults"],
    tags: ["CF", "infections"],
    references: [
      { label: "CDC — Cystic Fibrosis", url: "https://www.cdc.gov/cystic-fibrosis/about/index.html" }
    ]
  },
  {
    name: "Reduced lung growth / lung function",
    summary:
      "Childhood exposure to traffic‑related pollutants and fine particles is associated with reduced lung function growth.",
    pollutants: ["PM2.5", "NO2"],
    groups: ["Children"],
    tags: ["FEV1", "development"],
    references: [
      { label: "WHO — Children and Air Pollution", url: "https://www.who.int/publications-detail-redirect/air-pollution-and-child-health" }
    ]
  }
] as const;

const PILL =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border border-white/20 bg-white/5 backdrop-blur" as const;

// ===== Component =====
const RespiratoryDiseases: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [pollutant, setPollutant] = useState<FilterPollutant>("All");
  const [group, setGroup] = useState<FilterGroup>("All");

  const pollutants = useMemo<FilterPollutant[]>(
    () => ["All", ...Array.from(new Set(DISEASES.flatMap((d) => d.pollutants)))],
    []
  );

  const groups = useMemo<FilterGroup[]>(
    () => ["All", ...Array.from(new Set(DISEASES.flatMap((d) => d.groups ?? [])))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DISEASES.filter((d) => {
      const matchesQ =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        (d.tags ?? []).some((t) => t.toLowerCase().includes(q));
      const matchesPollutant = pollutant === "All" || d.pollutants.includes(pollutant as Pollutant);
      const matchesGroup = group === "All" || (d.groups ?? []).includes(group as Group);
      return matchesQ && matchesPollutant && matchesGroup;
    });
  }, [query, pollutant, group]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0A0424] to-[#18314F] text-[#C7E8F3]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Clairify — Respiratory Diseases Impacted by Air Pollution
          </h1>
          <p className="text-sm text-[#A4CCC1]">
            Explore conditions where air quality plays a role in symptoms, exacerbations, long‑term risk, or lung development.
          </p>
        </header>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="md:col-span-2">
            <label className="sr-only">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search diseases or keywords (e.g., asthma, pneumonia, FEV1)"
              className="w-full rounded-2xl bg-white/10 placeholder-white/60 text-white px-4 py-3 outline-none border border-white/20 focus:ring-2 focus:ring-[#C7E8F3]"
            />
          </div>

          <div>
            <label className="sr-only">Pollutant</label>
            <select
              value={pollutant}
              onChange={(e) => setPollutant(e.target.value as FilterPollutant)}
              className="w-full rounded-2xl bg-white/10 text-white px-4 py-3 border border-white/20 focus:ring-2 focus:ring-[#C7E8F3]"
            >
              {pollutants.map((p) => (
                <option key={p} value={p} className="bg-[#18314F]">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="sr-only">Sensitive group</label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value as FilterGroup)}
              className="w-full rounded-2xl bg-white/10 text-white px-4 py-3 border border-white/20 focus:ring-2 focus:ring-[#C7E8F3]"
            >
              {groups.map((g) => (
                <option key={g} value={g} className="bg-[#18314F]">
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <li
              key={d.name}
              className="group rounded-2xl bg-[#384E77]/30 border border-white/15 hover:border-white/25 transition overflow-hidden shadow-lg"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white leading-tight">{d.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {d.pollutants.map((p) => (
                      <span key={p} className={`${PILL} bg-[#0A0424]/40`}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-sm text-[#C7E8F3] opacity-90">{d.summary}</p>

                {!!(d.groups && d.groups.length) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {d.groups!.map((g) => (
                      <span key={g} className={`${PILL} text-[#C7E8F3]`}>
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {!!(d.references && d.references.length) && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    {d.references!.slice(0, 2).map((r) => (
                      <a
                        key={r.url}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 border border-white/20"
                      >
                        {r.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-10 text-center text-[#A4CCC1]">
            <p>No diseases matched your search. Try a different keyword or filter.</p>
          </div>
        )}

        {/* Footer note */}
        <footer className="mt-10 border-t border-white/15 pt-4 text-xs text-[#A4CCC1]">
          <p>
            Note: This directory is informational and not medical advice. For emergencies, call your local emergency number.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default RespiratoryDiseases;

// Optional: export data if you want to reuse it elsewhere
export const CLAIRIFY_DISEASES = DISEASES;