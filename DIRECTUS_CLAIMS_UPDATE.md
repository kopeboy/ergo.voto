# Aggiornamento Schema Claims per Fatti e Collegamenti Logici

Segui questi passaggi per aggiornare la collezione `claims` in Directus:

## 1. Aggiorna il campo `type`

1. Vai su http://localhost:8055
2. Login come admin
3. **Settings** → **Data Model** → **claims**
4. Clicca sul campo **`type`**
5. Modifica le **Choices**:
   - Rimuovi: `neutro`
   - Aggiungi: `fatto` → "Fatto"
   - Mantieni: `pro` → "Pro"
   - Mantieni: `contro` → "Contro"
6. **Default Value**: `fatto`
7. **Save**

## 2. Aggiungi relazione `citation_ids` (Many-to-Many)

1. Nella collezione `claims`, clicca **"Create Field"**
2. **Field Type**: `Many to Many (M2M)`
3. **Field Name**: `citation_ids`
4. **Related Collection**: `claims` (auto-referenziale)
5. **Junction Collection**: Lascia che Directus la crei automaticamente → `claims_claims`
6. **Interface**: `List (M2M)` oppure `Select Multiple Dropdown`
7. **Display Template**: `{{content}}` (mostra contenuto della claim citata)
8. **Required**: ❌ No
9. **Note**: Permette di selezionare multiple claims come citazioni per sillogismi
10. **Save**

Directus creerà automaticamente:
- Collezione junction `claims_claims` (non modificabile)
- Campi: `id`, `claims_id`, `related_claims_id`

## 3. Aggiungi campo `is_ergo` (Boolean)

1. Nella collezione `claims`, clicca **"Create Field"**
2. **Field Type**: `Boolean`
3. **Field Name**: `is_ergo`
4. **Interface**: `Toggle`
5. **Default Value**: `false`
6. **Required**: ❌ No
7. **Note**: Indica se questa claim è una deduzione logica (sillogismo)
8. **Save**

## 4. Verifica Permessi

Assicurati che i ruoli abbiano i permessi per:
- Leggere i campi `citations` e `is_ergo`
- Scrivere i campi `citations` e `is_ergo` durante la creazione/modifica

## 5. Rigenera i Tipi TypeScript

Dopo aver modificato lo schema in Directus:
```bash
npm run types:generate
```

Questo aggiornerà automaticamente `src/lib/generated-types.ts` con i nuovi campi.

## 6. Test

Dopo aver completato l'aggiornamento:
1. Vai su http://localhost:5173/debate/1
2. Prova a creare un **Fatto** (tipo grigio)
3. Prova a creare un **Pro** con checkbox **ERGO** selezionato
4. Verifica che le claims appaiano nelle colonne corrette

## Note

- **Fatti**: Informazioni verificabili, senza parent_id (risposte dirette alla domanda)
- **Pro/Contro**: Argomentazioni a favore/contrarie
- **ERGO**: Deduzioni logiche che citano altre claims/fatti come premesse
- **Citations**: Relazione Many-to-Many auto-referenziale (una claim può citare multiple altre claims come premesse)
- **Schema Auto-Generato**: Dopo aver modificato lo schema in Directus, esegui `npm run types:generate` per aggiornare i tipi TypeScript

## Layout Kialo-Style

Il nuovo layout separa visivamente:
- **Fatti** (full-width, grigio, in alto)
- **Pro** (colonna sinistra, verde)
- **Contro** (colonna destra, rossa)
