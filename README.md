# Ergo.voto

Piattaforma per dibattiti strutturati con argomentazioni gerarchiche e voto multi-dimensionale.

## 🎯 Caratteristiche

- **Struttura Gerarchica**: Argomentazioni organizzate in alberi Pro/Contro/Neutro
- **Voto Multi-Dimensionale**: Valuta Veridicità, Rilevanza e Impatto di ogni claim
- **Aggiornamenti Ottimistici**: Feedback immediato sui voti
- **Backend Headless**: Directus CMS con PostgreSQL
- **Schema-First**: Sincronizzazione automatica tra database e tipi TypeScript

## 🚀 Setup Iniziale

### Prerequisiti

- Node.js 18+ (installato via Homebrew)
- Docker Desktop o OrbStack (per Directus e PostgreSQL)

### 1. Installa le dipendenze

```sh
npm install
```

### 2. Avvia i servizi Docker

```sh
docker-compose up -d
```

Questo avvia:
- PostgreSQL 15 su porta 5432
- Directus su http://localhost:8055

### 3. Configura Directus (prima volta)

Vai su http://localhost:8055 e crea il primo utente amministratore.

### 4. Crea le tabelle in Directus

Segui la guida in `DIRECTUS_SETUP.md` per creare manualmente le collezioni `claims` e `votes` tramite l'interfaccia di Directus.

Dopo aver creato le collezioni, genera i tipi TypeScript:

```sh
npm run types:generate
```

### 5. Avvia il dev server

```sh
npm run dev
```

L'app sarà disponibile su http://localhost:5173

## 📁 Struttura del Progetto

```
ergo.voto/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── ClaimNode.svelte      # Componente ricorsivo per claim
│   │   ├── api/
│   │   │   └── votes.ts               # Helper per logica upsert voti
│   │   ├── types.ts                   # Tipi TypeScript manuali
│   │   ├── generated-types.ts         # Tipi auto-generati da Directus
│   │   ├── mockData.ts                # Dati mock per testing
│   │   └── directus.ts                # Configurazione SDK Directus
│   └── routes/
│       ├── +page.svelte               # Homepage
│       └── debate/[id]/
│           └── +page.svelte           # Pagina dibattito
├── scripts/
│   └── generate-types.ts              # Genera tipi TypeScript da Directus
├── DIRECTUS_SETUP.md                  # Guida setup manuale Directus
├── docker-compose.yml                 # Configurazione Docker
└── roadmap_fase1.md                   # Roadmap Fase 1
```

## 🔄 Workflow Schema Management

### Single Source of Truth

Lo schema è definito in Directus tramite l'interfaccia admin. I tipi TypeScript vengono generati automaticamente dallo schema per evitare duplicazione.

### Comandi Disponibili

```sh
# Genera tipi TypeScript dallo schema Directus
npm run types:generate
```

### Modificare lo Schema

1. Modifica le collezioni in Directus Admin (http://localhost:8055)
2. Esegui `npm run types:generate`
3. I tipi TypeScript vengono aggiornati automaticamente in `src/lib/generated-types.ts`

## 🛠️ Sviluppo

### Dev Server

```sh
npm run dev

# Apri automaticamente nel browser
npm run dev -- --open
```

### Type Checking

```sh
npm run check

# Watch mode
npm run check:watch
```

### Build Production

```sh
npm run build
npm run preview
```

## 🗄️ Database Schema

### Tabella `claims`

- `id` (UUID): Primary key
- `content` (Text): Contenuto dell'argomentazione
- `type` (String): Tipo claim - `'pro' | 'contro' | 'neutro'`
- `parent_id` (UUID): Riferimento al claim genitore (self-referencing)
- `status` (String): Stato moderazione - `'pending' | 'verified' | 'flagged'`
- `reason` (String): Motivo flag - `'duplicate' | 'fallacy' | 'fake'`
- `author` (String): Autore del claim
- `date_created`, `date_updated` (Timestamp): Timestamp automatici

### Tabella `votes`

- `id` (UUID): Primary key
- `claim_id` (UUID): Foreign key → claims.id
- `accuracy` (Integer): Voto accuratezza (+1, 0, o -1)
- `relevance` (Integer): Voto rilevanza (+1, 0, o -1)
- `user_updated` (UUID): Utente che ha votato/modificato (auto-popolato)
- `date_created`, `date_updated` (Timestamp): Timestamp automatici

**Nota:** Gli utenti possono modificare i propri voti. La logica upsert nel frontend controlla se esiste già un voto e lo aggiorna, altrimenti ne crea uno nuovo.

## 🔐 Autenticazione

Directus include un sistema di autenticazione integrato:
- **Solo utenti autenticati** possono creare/modificare claims
- **Solo utenti autenticati** possono votare (no voti anonimi per prevenire spam/bot)
- Gli utenti possono modificare i propri voti esistenti (upsert logic)
- Configurazione permessi in Directus Admin tramite Access Policies

## 📚 Stack Tecnico

- **Frontend**: SvelteKit 2 + TypeScript + Tailwind CSS 4
- **Backend**: Directus 11 (Headless CMS)
- **Database**: PostgreSQL 15
- **Container**: Docker + Docker Compose
- **Caching**: SWR (Stale-While-Revalidate) 60s per pagine pubbliche

## 🎨 UI Components

### ClaimNode.svelte

Componente ricorsivo che renderizza:
- Badge colorati per tipo (Pro=verde, Contro=rosso, Neutro=grigio)
- Thread lines stile Reddit per visualizzare la gerarchia
- Pulsanti di voto multi-dimensionale con contatori
- Supporto illimitato per livelli di nidificazione

## 📖 Roadmap

Vedi `roadmap_fase1.md` per i dettagli della Fase 1:
1. ✅ Setup SvelteKit + UI Ricorsiva (Mock Data)
2. ✅ Sistema di Voto Ottimistico
3. 🔄 Integrazione SDK Directus
4. ⏳ Setup Automazioni AI e Deploy VPS

## 🐛 Troubleshooting

### Docker non si avvia

```sh
# Verifica che Docker sia in esecuzione
docker ps

# Riavvia i container
docker-compose restart
```

### Directus non si connette al database

```sh
# Controlla i log
docker-compose logs directus

# Riavvia solo Directus
docker-compose restart directus
```

### Tipi TypeScript non sincronizzati

```sh
# Rigenera i tipi dallo schema Directus
npm run types:generate
```

## 📄 License

MIT

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
