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

Noch nicht umgesetzt: Sesselkonformation, weitere Zucker, Editor, Glykan-Modell, Nachweisreaktionen, Identifikator, Vergleich, Lernmodus, Service Worker.

## Lokal starten

```bash
npm install
npm run build
npm run dev
```

## Deployment

GitHub-Repository mit Vercel (Hobby) verbinden oder `vercel` bzw. `vercel --prod` ausführen. Es sind keine Umgebungsvariablen nötig.
