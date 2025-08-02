# UngService

En fullverdig webapp for småjobber utendørs hvor privatpersoner kan publisere og ta jobber som hagearbeid, snømåking, rydding og lignende.

## Funksjoner

### Brukerprofiler
- To brukerroller: arbeidsgiver og arbeidstaker (ungdom)
- Profilbilde, kontaktinfo, bio, vurderinger, antall jobber fullført

### Annonser og søk
- Opprett og rediger jobbannonser (tittel, beskrivelse, tidspunkt, beliggenhet, lønn)
- Kategorier og filtrering (gressklipping, snømåking, etc.)
- Kartvisning av jobber

### Forespørsler og matching
- Arbeidsgivere kan sende forespørsel til ungdom
- Ungdom kan godta eller avslå
- Mulighet for å chatte når match er oppnådd

### Meldinger og varslinger
- Sanntid meldingssystem med Firestore real-time updates
- Push-varsler når noen sender forespørsel, godtar, eller sender melding

### Dashboard/oversiktsside
- Jobber publisert, jobber du har søkt på, jobber du er booket til
- Kalender-integrasjon (valgbar)

### Vurdering og tilbakemelding
- Stjerner og skriftlig vurdering etter fullført jobb

### Autentisering og sikkerhet
- Logg inn med e-post eller Google
- Verifisering av e-post
- Kun innloggede brukere kan sende meldinger og forespørsler

## Teknologier

- **Frontend**: React 19 med TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Cloud Messaging)
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form med Yup validering
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast

## Installasjon

1. Klone prosjektet:
```bash
git clone <repository-url>
cd ungservice
```

2. Installer avhengigheter:
```bash
npm install
```

3. Konfigurer Firebase:
   - Opprett et Firebase-prosjekt på [Firebase Console](https://console.firebase.google.com/)
   - Aktiver Authentication (Email/Password og Google)
   - Aktiver Firestore Database
   - Aktiver Cloud Messaging
   - Kopier Firebase-konfigurasjonen til `src/config/firebase.ts`

4. Start utviklingsserveren:
```bash
npm start
```

## Prosjektstruktur

```
src/
├── components/
│   ├── auth/           # Autentiseringskomponenter
│   ├── jobs/           # Jobb-relaterte komponenter
│   ├── layout/         # Layout-komponenter
│   └── messages/       # Meldingskomponenter
├── contexts/           # React Context providers
├── pages/              # Sidekomponenter
├── types/              # TypeScript type definisjoner
├── config/             # Konfigurasjonsfiler
└── utils/              # Hjelpefunksjoner
```

## Utvikling

### Tilgjengelige scripts

- `npm start` - Starter utviklingsserveren
- `npm run build` - Bygger appen for produksjon
- `npm test` - Kjører tester
- `npm run eject` - Ejecter Create React App (irreversibelt)

### Firebase Setup

1. Opprett et nytt Firebase-prosjekt
2. Aktiver følgende tjenester:
   - Authentication (Email/Password, Google)
   - Firestore Database
   - Cloud Messaging (for push-varsler)

3. Oppdater `src/config/firebase.ts` med din Firebase-konfigurasjon

### Miljøvariabler

Opprett en `.env` fil i prosjektroten:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_VAPID_KEY=your-vapid-key
```

## Bidrag

1. Fork prosjektet
2. Opprett en feature branch (`git checkout -b feature/amazing-feature`)
3. Commit endringene (`git commit -m 'Add some amazing feature'`)
4. Push til branchen (`git push origin feature/amazing-feature`)
5. Opprett en Pull Request

## Lisens

Dette prosjektet er lisensiert under MIT-lisensen.
