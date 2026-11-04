# Chemistry Explorer

Kostenlose Chemie-Webanwendung (Schwerpunkt Kohlenhydrate). Next.js App Router, TypeScript, Tailwind CSS.

## Stand: Phase 1 und Teil von Phase 2

Umgesetzt:
- Universelles Eingabefeld mit automatischer Erkennung von Name, Summenformel, SMILES und InChI
- Abfrage bei PubChem (ohne API-Schlüssel, gedrosselt, mit Zwischenspeicher)
- Vier Identifikationszustände; „eindeutig“ wird bewusst noch nicht vergeben (folgt mit RDKit.js)
- Mehrdeutige Namen und Summenformeln zeigen Kandidaten
- Stärke, Amylose, Amylopektin, Glykogen und Cellulose als variable Polymere ohne erfundene Kette
- Letzte Suchen in IndexedDB, Dunkelmodus, PWA-Manifest

Phase 3 (Teil): Fischer- und Haworth-Ansicht mit α/β für Glucose, Galactose, Mannose (Pyranose) und Fructose (Furanose), aus Konfigurationsmodell erzeugt.

Phase 4 (neu, ungetestet): Struktur-Editor unter /editor mit Ketcher, automatische Neuberechnung mit RDKit.js, PubChem-Abgleich mit Einstufung A (bekannt), B (Stereoisomer/Anomer), C (unbekannt, kein Name).

Phase 5 (neu, ungetestet im Browser): Glykan-Modell (Bausteine und Bindungen) in `lib/glycan.ts`, Wissensbasis mit Maltose, Lactose, Saccharose, Cellobiose, Isomaltose, Trehalose, Maltotriose und Raffinose, berechnete Summenformel, Molmasse, reduzierende Enden, Verzweigungen, Hydrolyse-Simulation, anklickbare Schema-Darstellung (SNFG-Farben), Baukasten unter /glycan und Modellrechnung für Polysaccharide (Polymerisationsgrad n).

Phase 6 (neu, ungetestet im Browser): Wissensdatenbank mit neun Informationskarten (GOD, Seliwanoff, Fehling, Benedict, Barfoed, Iod, Molisch, Bial, Hydrolyse), automatische Zuordnung je Molekül aus der Struktur (reduzierende Enden, Ketose, Glucose, Polymertyp), Unterscheidung direkt und nach Hydrolyse, Sicherheitsbereich, Seite /tests. Die Zuordnung wurde gegen die Ergebnismatrix der Vorgabe getestet.

Phase 7 (neu, ungetestet im Browser): Kohlenhydrat-Identifikator unter /identifikator. Wählbare, geschlossene Kandidatenliste (Standard: Glucose, Stärke, Fructose, Saccharose, Galactose), Eintrag von Beobachtungen je Test (auch nach Hydrolyse), schrittweise Eingrenzung, Begründung der Ausschlüsse, Test-Vorschläge nach Trennschärfe, Widerspruchserkennung ohne voreilige Identifizierung. Keine Prozentangaben. Die Logik (`lib/identify.ts`) wurde mit zehn Szenarien getestet.

Noch nicht umgesetzt: Sesselkonformation, weitere Zucker, Editor, Glykan-Modell, Nachweisreaktionen, Identifikator, Vergleich, Lernmodus, Service Worker.

## Lokal starten

```bash
npm install --legacy-peer-deps
npm run build
npm run dev
```

Hinweis: Next.js ist auf Version 14 festgelegt, weil Ketcher React 18 benötigt. Ein Postinstall-Skript kopiert RDKit nach `public/rdkit`.

## Deployment

GitHub-Repository mit Vercel (Hobby) verbinden oder `vercel` bzw. `vercel --prod` ausführen. Es sind keine Umgebungsvariablen nötig.
