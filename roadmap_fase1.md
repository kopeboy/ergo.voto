# Roadmap MVP: Piattaforma Dibattiti Strutturati (Fase 1)

## Obiettivo
Sviluppare un prototipo funzionale di piattaforma per dibattiti gerarchici in pochi giorni.

## Stack Tecnico
- **Frontend:** SvelteKit + Tailwind CSS (Layout responsive, stile minimalista)
- **Backend:** Directus (PostgreSQL) ospitato via Docker.
- **Strategia Cache:** SWR (Stale-While-Revalidate) 60s per le pagine pubbliche.

## Struttura Dati & Logica
### 1. Claims (Tabella `claims`)
- Struttura ricorsiva tramite `parent_id`.
- Tipo: Pro, Contro o Neutro (colore visuale dedicato).
- Campi Directus built-in: `user_created`, `date_created`, `date_updated`
- Campi per Moderazione: `status` (draft, published, flagged), `reason` (duplicate, fallacy, fake).

### 2. Voto Multi-Dimensione (Tabella `votes`)
- Dimensioni: **Accuracy** (Accuratezza), **Relevance** (Rilevanza).
- Valore: +1, 0, o -1.
- **UI Ottimistica:** Il contatore deve aggiornarsi istantaneamente nel browser al click.
- **Upsert Logic:** Gli utenti possono modificare i propri voti esistenti.
- **Cache Locale:** Voti caricati al login per zero query extra durante il voto.

### 3. Caching & Performance
- SSR (Server Side Rendering) per SEO e velocità iniziale.
- Header `Cache-Control: public, s-maxage=60, stale-while-revalidate=3600`.
- **Vote Caching:** Store Svelte per cache locale dei voti (50% query in meno).

## Milestones

### ✅ Completati
1. **Setup SvelteKit + UI Ricorsiva (Mock Data) stile Reddit**
   - SvelteKit con TypeScript e Tailwind CSS
   - Componente ricorsivo `ClaimNode.svelte` con thread lines
   - Dati mock per testing UI
   - Homepage e pagina dibattito funzionanti

2. **Sistema di Voto Ottimistico**
   - Voto multi-dimensionale (Accuracy, Relevance)
   - Aggiornamento ottimistico locale
   - Sistema di cache per performance (`src/lib/stores/votes.ts`)
   - Helper API per upsert logic (`src/lib/api/votes.ts`)

3. **Setup Backend Directus**
   - Docker Compose con PostgreSQL 15 + Directus 11
   - Container in esecuzione su http://localhost:8055
   - SDK Directus installato e configurato
   - Guide per setup manuale e permessi

### 🔄 In Corso
4. **Configurazione Directus**
   - [ ] Creare collezioni `claims` e `votes` manualmente (vedi `DIRECTUS_SETUP.md`)
   - [ ] Configurare Access Policies per autenticazione (vedi `DIRECTUS_PERMISSIONS.md`)
   - [ ] Generare tipi TypeScript da schema: `npm run types:generate`

### ⏳ Prossimi Step
5. **Integrazione Frontend-Backend**
   - [ ] Sostituire dati mock con chiamate API Directus
   - [ ] Implementare autenticazione (login/logout)
   - [ ] Integrare `voteWithCache()` con backend reale
   - [ ] Caricare voti utente al login con `loadUserVotes()`
   - [ ] Aggregare voti per visualizzazione contatori

6. **Form Creazione Claims**
   - [ ] Form per nuovi claim con `parent_id` nascosto
   - [ ] Validazione lato client
   - [ ] Submit a Directus con autenticazione

7. **Ottimizzazioni & Deploy**
   - [ ] Setup automazioni AI in Directus (moderazione)
   - [ ] Configurazione cache HTTP
   - [ ] Preparazione Docker per VPS
   - [ ] Testing completo del flusso

## 📝 Note Tecniche

### Autenticazione
- **Solo utenti autenticati** possono creare claims e votare
- No voti anonimi (prevenzione spam/bot)
- Permessi gestiti tramite Access Policies in Directus

### Performance
- Cache locale voti: 1 query iniziale + 0 query per voto
- Risparmio: ~50% query rispetto a approccio base
- Memoria: ~1KB per 100 voti (trascurabile)

### File Importanti
- `DIRECTUS_SETUP.md` - Guida setup collezioni
- `DIRECTUS_PERMISSIONS.md` - Configurazione permessi
- `PERFORMANCE.md` - Ottimizzazioni e best practices
- `README.md` - Documentazione completa progetto