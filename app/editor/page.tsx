"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Ketcher } from "ketcher-core";
import { analyzeLocal, type LocalAnalysis } from "@/lib/rdkit";
import { matchStructure, type StructureMatch } from "@/lib/structure";
import { STATE_TEXT } from "@/lib/state";
import MoleculeCard from "@/components/MoleculeCard";

const KetcherEditor = dynamic(() => import("@/components/KetcherEditor"), {
  ssr: false,
  loading: () => <p className="p-6 text-muted">Editor wird geladen …</p>,
});

export default function EditorPage() {
  const editor = useRef<Ketcher | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runId = useRef(0);
  const [local, setLocal] = useState<LocalAnalysis | null>(null);
  const [match, setMatch] = useState<StructureMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "busy" | "done">("idle");
  const [selected, setSelected] = useState(0);

  const recompute = useCallback(async () => {
    const k = editor.current;
    if (!k) return;
    const id = ++runId.current;
    setPhase("busy");
    setLocal(null);
    setMatch(null);
    setError(null);
    setSelected(0);
    try {
      const molfile = await k.getMolfile();
      const analysis = await analyzeLocal(molfile);
      if (id !== runId.current) return;
      setLocal(analysis);
      setPhase("done");
      if (analysis.valid) {
        try {
          const found = await matchStructure(analysis);
          if (id === runId.current) setMatch(found);
        } catch (e) {
          if (id === runId.current) setError((e instanceof Error ? e.message : "PubChem-Abgleich fehlgeschlagen.") + " Die lokalen Werte bleiben verfügbar.");
        }
      }
    } catch (e) {
      if (id !== runId.current) return;
      setLocal({ valid: false, error: e instanceof Error ? e.message : "Die Auswertung ist fehlgeschlagen." });
      setPhase("done");
    }
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    runId.current++;
    setPhase("busy");
    timer.current = setTimeout(() => { void recompute(); }, 600);
  }, [recompute]);

  const onReady = useCallback(async (k: Ketcher) => {
    editor.current = k;
    const smiles = new URLSearchParams(window.location.search).get("smiles");
    if (smiles) {
      try { await k.setMolecule(smiles); }
      catch { setError("Die übergebene Struktur konnte nicht geladen werden."); }
    }
    k.editor.subscribe("change", schedule);
    void recompute();
  }, [recompute, schedule]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const current = match?.compounds[selected];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Struktur zeichnen</h1>
          <p className="text-sm text-muted">Die Struktur wird lokal mit RDKit.js geprüft und mit PubChem abgeglichen.</p>
        </div>
        <Link href="/" className="rounded-xl border border-line px-4 py-2 text-sm">Zur Suche</Link>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="h-[70vh] min-h-[460px] overflow-hidden rounded-2xl border border-line bg-white">
          <KetcherEditor onReady={onReady} onError={setError} />
        </div>
        <section aria-live="polite" className="min-w-0">
          {error && <p role="alert" className="mb-3 rounded-xl border border-warn p-3 text-sm text-warn">{error}</p>}
          {phase === "busy" && <p className="rounded-xl border border-line bg-card p-4 text-muted">Wird berechnet …</p>}
          {phase === "done" && local && !local.valid && <p className="rounded-xl border border-warn bg-card p-4 text-warn">{local.error}</p>}
          {phase === "done" && local?.valid && (
            <div className="rounded-xl border border-line bg-card p-4">
              <h2 className="font-semibold">Lokal berechnet mit RDKit.js</h2>
              <dl className="mt-2 text-sm">
                {([
                  ["Summenformel", local.formula],
                  ["Molare Masse", local.mass ? local.mass.toFixed(3) + " g/mol" : undefined],
                  ["Schweratome", String(local.heavyAtoms)],
                  ["CIP-Stereozentren", local.cipCenters === undefined ? undefined : String(local.cipCenters)],
                  ["SMILES", local.smiles], ["InChI", local.inchi], ["InChIKey", local.inchikey],
                ] as [string, string | undefined][]).filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="border-b border-line py-2">
                    <dt className="text-muted">{label}</dt><dd className="break-words font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {match && (
            <div className="mt-3 rounded-xl border border-line bg-card p-4">
              <p className="text-xs text-muted">{match.category} – {match.category === "A" ? "Bekannte Struktur" : match.category === "B" ? "Gleiche Verknüpfung, anderes Stereoisomer" : "Unbekannte Struktur"}</p>
              <h2 className="font-semibold">{STATE_TEXT[match.state]}</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted">{match.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              {match.compounds.map((compound, i) => (
                <button key={compound.cid} type="button" aria-pressed={selected === i} onClick={() => setSelected(i)}
                  className={`mt-2 block w-full rounded-lg border p-2 text-left text-sm ${selected === i ? "border-accent" : "border-line"}`}>
                  {compound.iupac ?? "PubChem CID " + compound.cid} · {compound.formula}
                </button>
              ))}
            </div>
          )}
          {current && <div className="mt-3"><MoleculeCard c={current} /></div>}
        </section>
      </div>
    </main>
  );
}
