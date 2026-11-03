import { hillFormula } from "./detect";

export interface RDMol {
  is_valid(): boolean;
  get_smiles(): string;
  get_inchi(): string;
  get_json(): string;
  get_descriptors(): string;
  get_num_atoms(): number;
  get_stereo_tags?: () => string;
  delete(): void;
}
export interface RDModule {
  get_mol(input: string): RDMol | null;
  get_inchikey_for_inchi?: (inchi: string) => string;
}
declare global {
  interface Window { initRDKitModule?: (options?: object) => Promise<RDModule>; }
}

let loading: Promise<RDModule> | null = null;

export function loadRDKit(): Promise<RDModule> {
  if (!loading) {
    loading = new Promise<RDModule>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/rdkit/RDKit_minimal.js";
      script.onload = () => {
        if (!window.initRDKitModule) return reject(new Error("RDKit.js wurde nicht initialisiert."));
        window.initRDKitModule({ locateFile: (file: string) => `/rdkit/${file}` }).then(resolve, reject);
      };
      script.onerror = () => reject(new Error("RDKit.js konnte nicht geladen werden."));
      document.head.appendChild(script);
    }).catch((error) => { loading = null; throw error; });
  }
  return loading;
}

const SYMBOLS = ["", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",
  "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr",
  "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"];

export type LocalAnalysis =
  | { valid: false; empty?: boolean; error: string }
  | { valid: true; smiles: string; inchi?: string; inchikey?: string; formula?: string; charged: boolean; mass?: number; heavyAtoms: number; cipCenters?: number };

function formulaFromJson(source: string): { formula?: string; charged: boolean } {
  try {
    const mol = JSON.parse(source).molecules?.[0];
    if (!mol?.atoms) return { charged: false };
    const counts: Record<string, number> = {};
    let charged = false;
    for (const atom of mol.atoms) {
      const symbol = SYMBOLS[atom.z];
      if (!symbol) return { charged: false };
      counts[symbol] = (counts[symbol] ?? 0) + 1;
      if (atom.impHs) counts.H = (counts.H ?? 0) + atom.impHs;
      if (atom.chg) charged = true;
    }
    return { formula: hillFormula(counts), charged };
  } catch {
    return { charged: false };
  }
}

export async function analyzeLocal(structure: string): Promise<LocalAnalysis> {
  const rd = await loadRDKit();
  let mol: RDMol | null = null;
  try {
    mol = rd.get_mol(structure);
    if (!mol || !mol.is_valid())
      return { valid: false, error: "Die Struktur ist chemisch ungültig oder unvollständig (z. B. Valenzfehler)." };
    const heavyAtoms = mol.get_num_atoms();
    if (heavyAtoms === 0) return { valid: false, empty: true, error: "Es ist noch keine Struktur gezeichnet." };
    const smiles = mol.get_smiles();
    const { formula, charged } = formulaFromJson(mol.get_json());
    let mass: number | undefined;
    try { mass = JSON.parse(mol.get_descriptors()).amw; } catch { /* optional */ }
    let inchi: string | undefined;
    let inchikey: string | undefined;
    try {
      inchi = mol.get_inchi() || undefined;
      if (inchi && rd.get_inchikey_for_inchi) inchikey = rd.get_inchikey_for_inchi(inchi);
    } catch { /* optional */ }
    let cipCenters: number | undefined;
    try {
      if (mol.get_stereo_tags) cipCenters = JSON.parse(mol.get_stereo_tags()).CIP_atoms?.length;
    } catch { /* optional */ }
    return { valid: true, smiles, inchi, inchikey, formula, charged, mass, heavyAtoms, cipCenters };
  } catch (error) {
    return { valid: false, error: "RDKit konnte die Struktur nicht verarbeiten: " + (error instanceof Error ? error.message : String(error)) };
  } finally {
    mol?.delete();
  }
}
