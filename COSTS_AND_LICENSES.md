# Kosten und Lizenzen

Stand: Phase 1. Gesamtkosten: 0,00 €. Prüfe vor dem Deployment die aktuellen Bedingungen der Dienste selbst.

| Name | Zweck | Lizenz / Bedingungen | Kosten | Limits / Hinweise |
|---|---|---|---|---|
| Next.js 14 | Framework (App Router; Version 14, weil Ketcher React 18 benötigt) | MIT | 0 € | – |
| React / React DOM | UI | MIT | 0 € | – |
| TypeScript | Sprache | Apache-2.0 | 0 € | – |
| Tailwind CSS 3 | Styling | MIT | 0 € | – |
| PubChem PUG REST | Moleküldaten | Öffentliche Daten der NCBI/NLM, eigene Nutzungsbedingungen | 0 € | Kein API-Schlüssel; max. ca. 5 Anfragen/s, die App drosselt auf ca. 4/s. Bedingungen vor Veröffentlichung prüfen. |
| RDKit.js (@rdkit/rdkit) | Struktur-Validierung und Berechnung im Browser | BSD-3-Clause | 0 € | Läuft lokal als WebAssembly; die Version in package.json vor Release prüfen |
| Ketcher (ketcher-react, -core, -standalone) | Struktur-Editor | Apache-2.0 | 0 € | Standalone-Variante ohne Server; Lizenz der Abhängigkeiten vor Release prüfen |
| styled-components | Abhängigkeit von Ketcher | MIT | 0 € | – |
| IndexedDB | Lokale Speicherung | Browser-Standard | 0 € | Kapazität vom Browser abhängig |
| Vercel Hobby | Hosting | Vercel-Bedingungen | 0 € | Hobby-Plan ist für nicht-kommerzielle Nutzung gedacht und hat Nutzungslimits. Kein Upgrade durchführen. |
| GitHub Free | Versionsverwaltung | GitHub-Bedingungen | 0 € | – |

Noch nicht integriert (Lizenz wird vor der Integration geprüft): shadcn/ui, ChEBI, GlyTouCan, GlyGen.
