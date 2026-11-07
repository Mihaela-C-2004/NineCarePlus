# 9Care+

**9 luni și tot ce urmează.** Prototip pentru Startup Ideas Competition: aplicația clinicii pentru sarcină și primul an după naștere.

- **Aplicația mamei** (telefon): Acasă, Starea mea, Asistent, Cursuri, Clinica, plus profilul din colț.
- **Panoul clinicii** (calculator): cereri live, paciente, administrare.
- **Mod zi / noapte**: butonul cu luna/soarele din colțul de sus, în ambele aplicații.
- **Telefon și calculator**: pe telefon meniul e jos, pe calculator e sus, iar ecranele se așază pe două coloane.
- **Căutare**: bara din antet (pe telefon, iconița cu lupa) caută în ghiduri, lecții, secțiuni și cererile proprii.
- **După naștere**: apar numele bebelușului și bebelușul, care „crește” lună de lună; culorile devin roz sau albastre după genul ales.
- **Programările nu se fac din aplicație**: rămân telefonice.

## Pornire

Ai nevoie de [Node.js](https://nodejs.org) (versiunea LTS). În VS Code, deschide folderul și terminalul (Ctrl + `):

```bash
npm install
npm run dev
```

| Ce | Adresa |
|---|---|
| Aplicația mamei | http://localhost:5173 |
| Panoul clinicii | http://localhost:5173/#clinica |

Codul clinicii la înscriere: **DEMO**. Pe telefon (aceeași rețea Wi-Fi), scanează codul QR din panoul clinicii → **Administrare**.

## Conturi demo (parola: `demo1234`)

| Cont | Situația |
|---|---|
| ana@demo.ro | Săptămâna 28, durerea crește în ultimele zile |
| ioana@demo.ro | Săptămâna 34, are o cerere văzută și analize |
| maria@demo.ro | După naștere, fetița Sofia (3 luni), tema roz |
| bianca@demo.ro | 17 ani, exemplu de pacientă minoră |

## Asistentul AI

Asistentul răspunde **doar** din articolele aprobate (`server/content.js`) și arată articolul folosit. Dacă mama descrie un simptom personal, nu răspunde: îi arată butoanele „Trimite o cerere clinicii” și „Urgență: sună la 112”. Conversațiile nu se salvează și nu ajung la clinică.

- **Fără cheie API (implicit):** răspunde cu rezumatul articolului cel mai potrivit.
- **Cu AI:** copiază `.env.example` ca `.env`, completează `ANTHROPIC_API_KEY`, apoi repornește `npm run dev`. Cheia stă doar pe server, nu ajunge în browser. Același model scrie și rezumatul cererilor pentru clinică.

## Fluxul demo pentru juriu

1. Panoul clinicii pe ecranul mare. Un membru al juriului scanează codul QR și își face cont.
2. **Acasă:** săptămâna de sarcină și fructul.
3. **Starea mea:** check-in cu durere 8 și somn prost.
4. **Asistent:** „Am dureri de spate, e normal?” → asistentul nu interpretează și arată butonul de cerere.
5. Trimite cererea, cu evoluția ultimelor 14 zile atașată.
6. Pe panou, cererea apare live, cu rezumat și grafic. Când medicul o deschide, pe telefon apare „Văzută”.
7. Medicul scrie răspunsul și apasă „Trimite și marchează rezolvată”. Pe telefon apare răspunsul.

Înainte de prezentare: **Resetează demo** (sus în panou). Pentru siguranță, țineți un video de rezervă și un hotspot.

## De știut

- **Analizele din poză** (Starea mea → Analize) se citesc în browser; prima citire are nevoie de internet. „Buletinul demo” e un buletin fictiv de test.
- **Datele** se salvează în `server/data/db.json`. Doar date fictive.
- **Panoul clinicii nu are login** în prototip. În pilot, personalul intră cu cont propriu.
- Conținutul (articole, cursuri, ghidul pentru acte) e **demonstrativ** și trebuie verificat de un medic și pe surse oficiale.

## Unde modifici

| Ce | Fișier |
|---|---|
| Articole, cursuri, oferte | `server/content.js` |
| Regulile asistentului și ale rezumatului | `server/assistant.js` |
| Conturile și datele demo, numele clinicii | `server/seed.js` |
| Fructele și dimensiunile | `src/data/fruits.js` |
| Culorile (zi și noapte) | începutul `src/styles.css` |
| Logoul | `src/components/ui.jsx` și `public/logo.svg` |
| Ilustrațiile fructelor și ale bebelușului | `public/img/` și `src/data/fruits.js`, `src/data/baby.js` |

## Licențe

Ilustrațiile 3D din `public/img/` sunt din [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji), licență MIT (permite folosirea și în proiecte comerciale).
