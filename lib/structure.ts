import * as pc from "./pubchem";
import type { Compound } from "./pubchem";
import type { State } from "./state";
import type { LocalAnalysis } from "./rdkit";

export type StructureMatch = {
  category: "A" | "B" | "C";
  state: State;
  compounds: Compound[];
  reasons: string[];
};

export async function matchStructure(local: Extract<LocalAnalysis, { valid: true }>): Promise<StructureMatch> {
  if (local.inchi) {
    const exact = await pc.byInchi(local.inchi);
    if (exact.length) {
      const hit = exact[0];
      if (hit.undefinedStereo === 0) return {
        category: "A", state: "eindeutig", compounds: [hit],
        reasons: ["Die Struktur stimmt exakt mit einem PubChem-Eintrag überein, dessen Stereozentren vollständig definiert sind."]
      };
      return {
        category: "A", state: "wahrscheinlich", compounds: [hit],
        reasons: ["Die Struktur stimmt mit einem PubChem-Eintrag überein, aber Stereoelemente sind nicht vollständig definiert."]
      };
    }
  }
  const cids = await pc.cidsSameConnectivity(local.smiles);
  if (cids.length) return {
    category: "B", state: "mehrdeutig", compounds: await pc.byCids(cids.slice(0, 6)),
    reasons: ["Die Atomverknüpfung ist bekannt, die räumliche Konfiguration stimmt aber nicht exakt überein oder ist nicht angegeben.", "Es wird kein Name vergeben. Die Einträge sind mögliche Stereoisomere oder Anomere."]
  };
  return {
    category: "C", state: "unbekannt", compounds: [],
    reasons: ["Für diese Struktur wurde kein PubChem-Eintrag gefunden. Es wird kein Name vergeben; angezeigt werden nur berechnete Werte."]
  };
}
