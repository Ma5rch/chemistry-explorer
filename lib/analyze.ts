import { detectInput, type Detected } from "./detect";
import * as pc from "./pubchem";
import type { Compound } from "./pubchem";
import { findPolymer, type PolymerEntry } from "./polymers";

export type State = "eindeutig" | "wahrscheinlich" | "mehrdeutig" | "unbekannt";
export type Result = {
  input: Detected;
  state: State;
  reasons: string[];
  compounds: Compound[];
  polymer?: PolymerEntry;
  partialList?: boolean;
};

// Namen häufiger Kohlenhydrate je Summenformel. Die Daten selbst kommen aus PubChem.
const SUGAR_NAMES: Record<string, string[]> = {
  C6H12O6: ["glucose", "fructose", "galactose", "mannose"],
  C12H22O11: ["sucrose", "maltose", "lactose", "trehalose", "cellobiose"],
};

const NOT_YET_VERIFIED =
  "„Eindeutig identifiziert“ wird erst vergeben, wenn Struktur und Stereochemie geprüft sind. Diese Prüfung folgt mit RDKit.js (Phase 4).";

export async function analyze(raw: string): Promise<Result> {
  const input = detectInput(raw);

  if (input.kind === "name") {
    const polymer = findPolymer(input.value);
    if (polymer) {
      return { input, state: "mehrdeutig", polymer, compounds: [], reasons: [polymer.note] };
    }
    const all = await pc.byName(input.value);
    if (all.length === 0)
      return { input, state: "unbekannt", compounds: [], reasons: ["Für diesen Namen wurde kein PubChem-Eintrag gefunden."] };
    if (all.length === 1)
      return { input, state: "wahrscheinlich", compounds: all, reasons: ["Der Name passt zu genau einem PubChem-Eintrag.", NOT_YET_VERIFIED] };
    return {
      input,
      state: "mehrdeutig",
      compounds: all.slice(0, 8),
      partialList: all.length > 8,
      reasons: [
        `Der Name passt zu ${all.length} PubChem-Einträgen, z. B. verschiedenen Stereoisomeren oder Ringformen.`,
        "Bitte den gewünschten Eintrag auswählen.",
      ],
    };
  }

  if (input.kind === "formula") {
    const cids = new Set<number>();
    const list: Compound[] = [];
    for (const name of SUGAR_NAMES[input.value] ?? []) {
      const hit = (await pc.byName(name)).find((c) => c.formula === input.value);
      if (hit && !cids.has(hit.cid)) { cids.add(hit.cid); list.push(hit); }
    }
    const extra = (await pc.cidsByFormula(input.value)).filter((c) => !cids.has(c));
    list.push(...(await pc.byCids(extra)));
    if (list.length === 0)
      return { input, state: "unbekannt", compounds: [], reasons: ["Zu dieser Summenformel wurde in PubChem kein Eintrag gefunden."] };
    return {
      input,
      state: "mehrdeutig",
      compounds: list,
      partialList: true,
      reasons: [
        "Eine Summenformel allein identifiziert kein Molekül. Sie passt zu mehreren Isomeren.",
        "Die Liste ist eine begrenzte Auswahl und nicht vollständig.",
      ],
    };
  }

  const found = input.kind === "smiles" ? await pc.bySmiles(input.value) : await pc.byInchi(input.value);
  if (found.length === 0)
    return { input, state: "unbekannt", compounds: [], reasons: ["Für diese Struktur wurde kein PubChem-Eintrag gefunden. Es wird kein Name vergeben."] };
  const reasons = [NOT_YET_VERIFIED];
  if (input.kind === "smiles" && !/[@/\\]/.test(input.value))
    reasons.unshift("Die Eingabe enthält keine Stereoinformation. Die räumliche Konfiguration ist nicht bestimmt.");
  return { input, state: "wahrscheinlich", compounds: found.slice(0, 1), reasons };
}
