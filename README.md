# Chemistry Explorer

Kostenlose Chemie-Webanwendung mit Schwerpunkt Kohlenhydrate. Next.js App Router, TypeScript und Tailwind CSS.

## Funktionen

- Universelles Eingabefeld für Namen, Summenformeln, SMILES und InChI.
- PubChem-Abfrage ohne API-Schlüssel, mit Drosselung und Zwischenspeicher.
- Kennzeichnung mehrdeutiger oder nicht sicher identifizierter Ergebnisse.
- Stärke, Amylose, Amylopektin, Glykogen und Cellulose als variable Polymere ohne erfundene Ketten.
- Fischer- und Haworth-Projektionen für ausgewählte D-Monosaccharide; Umschaltung zwischen α- und β-Form.
- Struktur-Editor unter `/editor` mit Ketcher.
- Lokale Strukturprüfung und Berechnung mit RDKit.js (WebAssembly).
- PubChem-Abgleich für gezeichnete Strukturen.
- Letzte Suchen in IndexedDB und PWA-Manifest.

## Installation und Start

Die Datei `.npmrc` aktiviert `legacy-peer-deps=true`, da Ketcher in diesem Projekt React 18 voraussetzt.

```bash
npm install
npm run build
npm run dev
```

Das Postinstall-Skript kopiert die RDKit-JavaScript- und WebAssembly-Dateien aus `node_modules` nach `public/rdkit`.

## Wichtige Grenzen

Die Fischer- und Haworth-Zeichnungen decken derzeit nur ausgewählte Ringformen ab. Sesselkonformation, weitere Zucker, Glykan-Modell, Nachweisreaktionen, Vergleichs- und Lernmodus sind noch nicht umgesetzt. Die chemische Zuordnung im Struktur-Editor hängt vom verfügbaren PubChem-Abgleich ab; bei unsicheren Ergebnissen wird kein eindeutiger Name behauptet.

## Kosten

Die verwendeten Bibliotheken und Dienste sind laut Projektplanung kostenlos nutzbar; beachte vor einer Veröffentlichung dennoch die jeweiligen Lizenzen, Nutzungsbedingungen und kostenlosen Kontingente. Details stehen in `COSTS_AND_LICENSES.md`.
