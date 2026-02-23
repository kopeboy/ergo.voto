# Setup Collezione Debates in Directus

## 1. Crea Collezione `debates`

1. Vai su **Settings** → **Data Model**
2. Clicca **"Create Collection"**
3. Configurazione:
   - **Collection Name**: `debates`
   - **Primary Key Field**: `id` (auto-increment)
   - **Optional System Fields**: ✅ Seleziona tutti (user_created, date_created, user_updated, date_updated)
4. **Save**

---

## 2. Aggiungi Campi alla Collezione `debates`

### Campo: `title`
- **Type**: String
- **Field Name**: `title`
- **Interface**: Input
- **Required**: ✅ Yes
- **Note**: Titolo breve del dibattito (es. "Cambiamento Climatico")

### Campo: `description`
- **Type**: Text
- **Field Name**: `description`
- **Interface**: Textarea
- **Required**: ❌ No
- **Note**: Descrizione estesa del dibattito (opzionale)

### Campo: `question`
- **Type**: Text
- **Field Name**: `question`
- **Interface**: Textarea
- **Required**: ✅ Yes
- **Note**: La domanda principale che avvia il dibattito (es. "Il cambiamento climatico richiede azione immediata?")

### Campo: `status`
- **Type**: String
- **Field Name**: `status`
- **Interface**: Dropdown
- **Required**: ✅ Yes
- **Default Value**: `draft`
- **Choices**:
  - `draft` - Bozza
  - `published` - Pubblicato
  - `closed` - Chiuso
- **Note**: Stato del dibattito

---

## 3. Aggiungi Campo `debate_id` alla Collezione `claims`

1. Vai su **Settings** → **Data Model** → **`claims`**
2. Clicca **"Create Field"**
3. Configurazione:
   - **Type**: **Many to One** (relazione)
   - **Field Name**: `debate_id`
   - **Related Collection**: `debates`
   - **Required**: ✅ Yes
4. **Save**

**Nota**: Questo crea una relazione Many-to-One: molti claims appartengono a un debate.

---

## 4. Configura Permessi per `debates`

### Public Policy (utenti non autenticati):
- **Read**: ✅ Custom Access
  - Filter: `status` equals `published`
- **Create**: ❌ No Access
- **Update**: ❌ No Access
- **Delete**: ❌ No Access

### User Policy (utenti autenticati standard):
- **Read**: ✅ All Access
- **Create**: ❌ No Access (solo ruolo "Pro" può creare dibattiti)
- **Update**: ❌ No Access
- **Delete**: ❌ No Access

### Pro User Policy (utenti con ruolo "Pro"):
1. Crea un nuovo ruolo **"Pro"** in **Settings** → **User Roles**
2. Crea una nuova Access Policy per il ruolo "Pro"
3. Configura permessi per `debates`:
   - **Read**: ✅ All Access
   - **Create**: ✅ All Access
   - **Update**: ✅ Custom Access
     - Filter: `user_created` equals `$CURRENT_USER`
   - **Delete**: ❌ No Access

---

## 5. Aggiorna Permessi per `claims`

Ora che i claims hanno `debate_id`, aggiorna i permessi:

### User Policy:
- **Create**: ✅ All Access (tutti possono creare claims in dibattiti esistenti)
- **Update**: ✅ Custom Access
  - Filter: `user_created` equals `$CURRENT_USER`

---

## 6. Test della Configurazione

Crea dati di test per verificare che tutto funzioni:

1. **Crea un debate** (richiede utente Pro):
   ```bash
   curl -X POST http://localhost:8055/items/debates \
     -H "Authorization: Bearer YOUR_PRO_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Cambiamento Climatico",
       "question": "Il cambiamento climatico richiede azione immediata?",
       "description": "Dibattito sulle politiche climatiche",
       "status": "published"
     }'
   ```

2. **Crea claims root** (parent_id = null):
   ```bash
   curl -X POST http://localhost:8055/items/claims \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "debate_id": 1,
       "content": "Le evidenze scientifiche dimostrano un aumento delle temperature",
       "type": "pro",
       "status": "published"
     }'
   ```

3. **Crea claims figli**:
   ```bash
   curl -X POST http://localhost:8055/items/claims \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "debate_id": 1,
       "parent_id": 5,
       "content": "Il 97% degli scienziati concorda sul riscaldamento globale",
       "type": "pro",
       "status": "published"
     }'
   ```

4. **Verifica il filtro per debate_id**:
   ```bash
   curl 'http://localhost:8055/items/claims?filter[debate_id][_eq]=1&filter[status][_eq]=published'
   ```

---

## 7. Rigenera Tipi TypeScript

Dopo aver creato la collezione e aggiunto i campi:

```bash
npm run types:generate
```

---

## Riepilogo Struttura

```
debates
├── id (auto)
├── title (string, required)
├── description (text, optional)
├── question (text, required)
├── status (draft | published | closed)
├── user_created (auto)
├── date_created (auto)
├── user_updated (auto)
└── date_updated (auto)

claims
├── id (auto)
├── debate_id (M2O → debates, required) ← NUOVO
├── content (text, required)
├── type (pro | contro | neutro)
├── parent_id (M2O → claims, nullable)
├── status (draft | published | flagged)
├── reason (nullable)
├── user_created (auto)
├── date_created (auto)
├── user_updated (auto)
└── date_updated (auto)
```

---

## Note Importanti

- **Ogni claim deve avere un `debate_id`** - non possono esistere claims orfani
- **Claims root** hanno `parent_id = null` e rappresentano il primo livello del dibattito
- **Solo utenti "Pro"** possono creare nuovi dibattiti
- **Tutti gli utenti autenticati** possono creare claims in dibattiti esistenti
- **Campi `user_updated` e `date_updated`** si popolano automaticamente sia alla creazione che all'aggiornamento
- **Campo `sort`** è disponibile per ordinamento manuale futuro (non ancora implementato nel frontend)

---

## ✅ Setup Completato

La struttura debates è stata implementata con successo:
- ✅ Collezione `debates` creata con tutti i campi
- ✅ Campo `debate_id` aggiunto a `claims` (relazione M2O)
- ✅ Permessi configurati (Public, User, Pro User)
- ✅ Tipi TypeScript rigenerati
- ✅ API aggiornate per filtrare claims per `debate_id`
- ✅ Pagina `/debate/[id]` carica solo i claims del dibattito specifico
- ✅ Dati di test creati (2 debates con claims)
