import { detectInput, type Detected } from "./detect";
import * as pc from "./pubchem";
import type { Compound } from "./pubchem";
import { findPolymer, type PolymerEntry } from "./polymers";
import type { State } from "./state";
export type { State } from "./state";

export type Result = {
  input: Detected;
  state: State;
  reasons: string[];
  compounds: Compound[];
  polymer?: PolymerEntry;
  partialList?: boolean;
};

const SUGAR_NAMES: Record<string, string[]> = {
  C6H12O6: ["glucose", "fructose", "galactose", "mannose"],
  C12H22O11: ["sucrose", "maltose", "lactose", "trehalose", "cellobiose"],
};

export async function analyze(raw: string): Promise<Result> {
  const input = detectInput(raw);
  if (input.kind === "name") {
    const polymer = findPolymer(input.value);
    if (polymer) return { input, state: "mehrdeutig", polymer, compounds: [], reasons: [polymer.note] };
    const all = await pc.byName(input.value);
    if (!all.length) return { input, state: "unbekannt", compounds: [], reasons: ["Für diesen Namen wurde kein PubChem-Eintrag gefunden."] };
    if (all.length === 1) return {
      input, state: "wahrscheinlich", compounds: all,
      reasons: ["Der Name passt zu genau einem PubChem-Eintrag. Die Stereochemie wird mit RDKit.js im Struktur-Editor geprüft."]
    };
    return {
      input, state: "mehrdeutig", compounds: all.slice(0, 8), partialList: all.length > 8,
      reasons: [`Der Name passt zu ${all.length} PubChem-Einträgen, z. B. verschiedenen Stereoisomeren oder Ringformen.`, "Bitte den gewünschten Eintrag auswählen."]
    };
  }

  if (input.kind === "formula") {
    const cids = new Set<number>();
    const list: Compound[] = [];
    for (const name of SUGAR_NAMES[input.value] ?? []) {
      const hit = (await pc.byName(name)).find((compound) => compound.formula === input.value);
      if (hit && !cids.has(hit.cid)) { cids.add(hit.cid); list.push(hit); }
    }
    const extra = (await pc.cidsByFormula(input.value)).filter((cid) => !cids.has(cid));
    list.push(...await pc.byCids(extra));
    if (!list.length) return { input, state: "unbekannt", compounds: [], reasons: ["Zu dieser Summenformel wurde in PubChem kein Eintrag gefunden."] };
    return {
      input, state: "mehrdeutig", compounds: list, partialList: true,
      reasons: ["Eine Summenformel allein identifiziert kein Molekül. Sie passt zu mehreren Isomeren.", "Die Liste ist eine begrenzte Auswahl und nicht vollständig."]
    };
  }

  const found = input.kind === "smiles" ? await pc.bySmiles(input.value) : await pc.byInchi(input.value);
  if (!found.length) return { input, state: "unbekannt", compounds: [], reasons: ["Für diese Struktur wurde kein PubChem-Eintrag gefunden. Es wird kein Name vergeben."] };
  const hit = found[0];
  if (hit.undefinedStereo === 0) return {
    input, state: "eindeutig", compounds: [hit],
    reasons: ["Die Struktur stimmt exakt mit einem PubChem-Eintrag überein, dessen Stereozentren vollständig definiert sind."]
  };
  const reasons: string[] = [];
  if (hit.undefinedStereo) reasons.push(`Im passenden PubChem-Eintrag sind ${hit.undefinedStereo} Stereoelement(e) nicht definiert.`);
  if (input.kind === "smiles" && !/[@/\\]/.test(input.value)) reasons.unshift("Die Eingabe enthält keine Stereoinformation. Die räumliche Konfiguration ist nicht bestimmt.");
  if (!reasons.length) reasons.push("Eine eindeutige Stereochemie-Prüfung ist noch nicht möglich.");
  return { input, state: "wahrscheinlich", compounds: [hit], reasons };
}
