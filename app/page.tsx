"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { analyze, type Result } from "@/lib/analyze";
import { STATE_TEXT } from "@/lib/state";
import { addRecent, listRecent } from "@/lib/store";
import MoleculeCard from "@/components/MoleculeCard";
import SugarViewer from "@/components/SugarViewer";
import { findSugar, type Sugar } from "@/lib/sugars";

const QUICK = ["Glucose", "Fructose", "Galactose", "Mannose", "Saccharose", "Maltose", "Lactose", "Stärke", "Cellulose", "C6H12O6"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [sugar, setSugar] = useState<Sugar | null>(null);
  const [selected, setSelected] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => { listRecent().then(setRecent); }, []);

  async function run(value: string) {
    const q = value.trim();
    if (!q) return;
    setQuery(q);
    setSugar(findSugar(q) ?? null);
    setBusy(true);
    setError(null);
    try {
      const next = await analyze(q);
      setResult(next);
      setSelected(0);
      await addRecent(q);
      setRecent(await listRecent());
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Die Abfrage ist fehlgeschlagen. Bitte prüfe die Internetverbindung.");
    } finally {
      setBusy(false);
    }
  }

  const current = result?.compounds[selected];

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Chemistry Explorer</h1>
        <p className="mt-1 text-muted">Moleküle nachschlagen, zeichnen und untersuchen.</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); void run(query); }} className="rounded-2xl border border-line bg-card p-4">
        <label htmlFor="q" className="mb-2 block font-medium">Molekülname, Summenformel, SMILES oder InChI</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="z. B. Glucose oder C6H12O6"
            autoCapitalize="off" autoCorrect="off" spellCheck={false}
            className="min-h-12 flex-1 rounded-xl border border-line bg-paper px-4" />
          <button type="submit" disabled={busy || !query.trim()} className="min-h-12 rounded-xl bg-accent px-6 font-medium text-paper disabled:opacity-50">
            {busy ? "Analysiere …" : "Analysieren"}
          </button>
          <Link href="/editor" className="flex min-h-12 items-center justify-center rounded-xl border border-line px-5">Struktur zeichnen</Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK.map((q) => <button key={q} type="button" onClick={() => void run(q)} className="min-h-9 rounded-full border border-line px-3 text-sm">{q}</button>)}
        </div>
        {recent.length > 0 && <p className="mt-3 text-sm text-muted">Zuletzt: {recent.map((q) => <button key={q} type="button" onClick={() => void run(q)} className="mr-2 text-accent underline">{q}</button>)}</p>}
      </form>

      {error && <p role="alert" className="mt-4 rounded-xl border border-warn p-3 text-warn">{error}</p>}

      {sugar && <div className="mt-6"><SugarViewer sugar={sugar} /></div>}

      {result && (
        <section className="mt-6" aria-live="polite">
          <p className="text-sm text-muted">Erkannte Eingabe: {result.input.kind}</p>
          {result.polymer ? (
            <article className="mt-2 rounded-2xl border border-line bg-card p-5">
              <h2 className="text-xl font-semibold">{result.polymer.title}</h2>
              <p className="text-muted">{result.polymer.kind}</p>
              <p className="mt-3 rounded-xl border border-warn p-3 text-sm text-warn">Variable Polymerstruktur: Es wird keine erfundene Molekülkette angezeigt.</p>
              <dl className="mt-3 text-sm">
                {result.polymer.facts.map((f) => <div key={f.label} className="flex flex-wrap justify-between gap-2 border-b border-line py-2">
                  <dt className="text-muted">{f.label}</dt><dd>{f.value} ({f.state})</dd>
                </div>)}
              </dl>
              <p className="mt-3 text-sm">{result.polymer.note}</p>
            </article>
          ) : (
            <>
              <div className="mt-2 rounded-2xl border border-line bg-card p-4">
                <h2 className="font-semibold">{STATE_TEXT[result.state]}</h2>
                <ul className="mt-1 list-disc pl-5 text-sm text-muted">{result.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              {result.compounds.length > 1 && <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {result.compounds.map((c, i) => <button key={c.cid} type="button" onClick={() => setSelected(i)}
                  aria-pressed={i === selected} className={`rounded-xl border bg-card p-3 text-left text-sm ${i === selected ? "border-accent" : "border-line"}`}>
                  <span className="block font-medium">{c.iupac ?? `CID ${c.cid}`}</span><span className="text-muted">{c.formula} · CID {c.cid}</span>
                </button>)}
              </div>}
              {current && <div className="mt-4"><MoleculeCard c={current} /></div>}
            </>
          )}
        </section>
      )}
    </main>
  );
}
