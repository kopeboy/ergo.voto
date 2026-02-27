# TODO - Ergo.voto

## Completati ✅
- [x] PostgreSQL trigger per `vote_score` - Automatizza aggiornamento al cambio voti
- [x] Ordinamento argomenti per `vote_score` DESC
- [x] Fix vote logic - Semplificato upsertVote per ritornare solo delta
- [x] Fix DebateForm - Spostato in dialog, fix label "Tipo"
- [x] Fix focus color - Usa variabile CSS primaria gialla
- [x] Fix label alignment ArgumentForm - Text-left e text-gray-900
- [x] Optimistic UI - Scroll e highlight per nuovi argomenti
- [x] Toast notifications - Per creazione argomenti (invece di alert e reload)
- [x] Child arguments count - Link cliccabili "2 Conferme" / "3 Obiezioni"
- [x] Argument expansion view - Layout a due colonne quando entrambi conferme e obiezioni sono visibili

## Prossimi Sviluppi

### UI/UX Improvements (Roadmap)
- [ ] **Pagina dedicata per creazione dibattiti** - Spostare il form da dialog a pagina separata `/debates/new`
- [ ] **ArgumentForm inline** - Cambiare da dialog a inline quando non ci sono altri figli da espandere

### Features
- [ ] **Moderazione argomenti** - Sistema di flag/report per contenuti inappropriati
- [ ] **Sistema di reputation utenti** - Badge e livelli basati su contributi e qualità

### Refactoring
- [ ] Accessibility warnings - Aggiungere keyboard handlers dove necessario
- [ ] Rimuovere RichTextEditor non utilizzato se non serve
- [ ] Consolidare stili CSS duplicati
