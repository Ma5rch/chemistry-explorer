// PubChem PUG REST – kostenlos, ohne API-Schlüssel, CORS-fähig.
const BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const PROPS = "MolecularFormula,MolecularWeight,IUPACName,SMILES,InChI,InChIKey";

export type Compound = {
  cid: number;
  formula: string;
  weight: string;
  iupac?: string;
  smiles?: string;
  inchi?: string;
  inchikey?: string;
};

const cache = new Map<string, unknown>();
let chain: Promise<unknown> = Promise.resolve();

/** Drosselt Anfragen (PubChem erlaubt max. ca. 5 pro Sekunde). */
function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => new Promise((r) => setTimeout(r, 250)),
    () => new Promise((r) => setTimeout(r, 250))
  );
  return run;
}

async function request(url: string, body?: string): Promise<any | null> {
  const key = url + "|" + (body ?? "");
  if (cache.has(key)) return cache.get(key);
  const res = await throttled(() =>
    fetch(url, body
      ? { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }
      : undefined)
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`PubChem antwortete mit Status ${res.status}.`);
  const json = await res.json();
  cache.set(key, json);
  return json;
}

function toCompounds(json: any): Compound[] {
  const rows: any[] = json?.PropertyTable?.Properties ?? [];
  return rows.map((p) => ({
    cid: p.CID,
    formula: p.MolecularFormula,
    weight: String(p.MolecularWeight),
    iupac: p.IUPACName,
    smiles: p.SMILES ?? p.IsomericSMILES ?? p.ConnectivitySMILES ?? p.CanonicalSMILES,
    inchi: p.InChI,
    inchikey: p.InChIKey,
  }));
}

export async function byName(name: string): Promise<Compound[]> {
  const json = await request(`${BASE}/compound/name/${encodeURIComponent(name)}/property/${PROPS}/JSON`);
  return toCompounds(json);
}

export async function byCids(cids: number[]): Promise<Compound[]> {
  if (!cids.length) return [];
  return toCompounds(await request(`${BASE}/compound/cid/${cids.join(",")}/property/${PROPS}/JSON`));
}

export async function bySmiles(smiles: string): Promise<Compound[]> {
  return toCompounds(await request(`${BASE}/compound/smiles/property/${PROPS}/JSON`, "smiles=" + encodeURIComponent(smiles)));
}

export async function byInchi(inchi: string): Promise<Compound[]> {
  return toCompounds(await request(`${BASE}/compound/inchi/property/${PROPS}/JSON`, "inchi=" + encodeURIComponent(inchi)));
}

/** Liefert eine begrenzte, unvollständige Auswahl an CIDs zu einer Summenformel. */
export async function cidsByFormula(formula: string, max = 12): Promise<number[]> {
  let json = await request(`${BASE}/compound/fastformula/${encodeURIComponent(formula)}/cids/JSON?MaxRecords=${max}`);
  for (let i = 0; i < 5 && json?.Waiting?.ListKey; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    json = await request(`${BASE}/compound/listkey/${json.Waiting.ListKey}/cids/JSON?MaxRecords=${max}`);
  }
  return json?.IdentifierList?.CID ?? [];
}

export const structureImageUrl = (cid: number) => `${BASE}/compound/cid/${cid}/PNG?image_size=large`;
export const compoundPageUrl = (cid: number) => `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
