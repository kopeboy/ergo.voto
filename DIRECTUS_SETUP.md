# Setup Manuale Directus

Segui questi passaggi per configurare le tabelle in Directus:

## 1. Crea la Collezione "claims"

1. Vai su http://localhost:8055
2. Login come admin
3. Clicca su **Settings** (icona ingranaggio) → **Data Model**
4. Clicca **"Create Collection"**
5. Configura:
   - **Collection Name**: `claims`
   - **Primary Key Field**: `id` (UUID, auto-generated)
   - **Icon**: `chat_bubble`
   - Clicca **"Save"**

### Aggiungi i campi a "claims":

Clicca sulla collezione `claims` appena creata e aggiungi questi campi:

#### Campo: content
- **Field Name**: `content`
- **Type**: `Text` (Long Text)
- **Interface**: `Input (Multiline)`
- **Required**: ✅ Yes
- **Save**

#### Campo: type
- **Field Name**: `type`
- **Type**: `String`
- **Interface**: `Dropdown`
- **Required**: ✅ Yes
- **Default Value**: `neutro`
- **Choices**:
  - `pro` → "Pro"
  - `contro` → "Contro"
  - `neutro` → "Neutro"
- **Save**

#### Campo: parent_id
- **Field Name**: `parent_id`
- **Type**: `UUID`
- **Interface**: `Many to One` (M2O)
- **Related Collection**: `claims` (self-referencing)
- **Required**: ❌ No (nullable)
- **Save**

#### Campo: status
- **Field Name**: `status`
- **Type**: `String`
- **Interface**: `Dropdown`
- **Default Value**: `pending`
- **Choices**:
  - `pending` → "Pending"
  - `verified` → "Verified"
  - `flagged` → "Flagged"
- **Save**

#### Campo: reason
- **Field Name**: `reason`
- **Type**: `String`
- **Interface**: `Dropdown`
- **Required**: ❌ No
- **Choices**:
  - `duplicate` → "Duplicate"
  - `fallacy` → "Fallacy"
  - `fake` → "Fake"
- **Save**

#### Campo: author
- **Field Name**: `author`
- **Type**: `String`
- **Interface**: `Input`
- **Required**: ❌ No
- **Save**

#### Campi automatici (già presenti):
- `date_created` (auto-generato)
- `date_updated` (auto-generato)

---

## 2. Crea la Collezione "votes"

1. Torna a **Settings** → **Data Model**
2. Clicca **"Create Collection"**
3. Configura:
   - **Collection Name**: `votes`
   - **Primary Key Field**: `id` (UUID, auto-generated)
   - **Icon**: `how_to_vote`
   - Clicca **"Save"**

### Aggiungi i campi a "votes":

#### Campo: claim_id
- **Field Name**: `claim_id`
- **Type**: `UUID`
- **Interface**: `Many to One` (M2O)
- **Related Collection**: `claims`
- **Required**: ✅ Yes
- **Save**

#### Campo: user_id
- **Field Name**: `user_id`
- **Type**: `String`
- **Interface**: `Input`
- **Note**: "IP address or user identifier"
- **Required**: ❌ No
- **Save**

#### Campo: veridicita
- **Field Name**: `veridicita`
- **Type**: `Integer`
- **Interface**: `Input`
- **Default Value**: `0`
- **Note**: "Vote value: +1 or -1"
- **Required**: ✅ Yes
- **Save**

#### Campo: rilevanza
- **Field Name**: `rilevanza`
- **Type**: `Integer`
- **Interface**: `Input`
- **Default Value**: `0`
- **Note**: "Vote value: +1 or -1"
- **Required**: ✅ Yes
- **Save**

#### Campo: impatto
- **Field Name**: `impatto`
- **Type**: `Integer`
- **Interface**: `Input`
- **Default Value**: `0`
- **Note**: "Vote value: +1 or -1"
- **Required**: ✅ Yes
- **Save**

#### Campi automatici (già presenti):
- `date_created` (auto-generato)

---

## 3. Configura i Permessi

### Per la collezione "claims":

1. Vai su **Settings** → **Access Control** → **Public**
2. Seleziona collezione `claims`
3. Configura permessi:
   - **Read**: ✅ All (tutti possono leggere)
   - **Create**: ❌ No (solo utenti autenticati)
   - **Update**: ❌ No (solo utenti autenticati)
   - **Delete**: ❌ No (solo admin)

### Per utenti autenticati:

1. Vai su **Settings** → **Access Control** → **Create Role**
2. Nome: `User`
3. Per collezione `claims`:
   - **Read**: ✅ All
   - **Create**: ✅ All
   - **Update**: ✅ Own items only (campo `author` = user ID)
   - **Delete**: ❌ No

### Per la collezione "votes":

1. **Public**:
   - **Read**: ✅ All (aggregati visibili)
   - **Create**: ✅ All (voti anonimi permessi)
   - **Update**: ❌ No
   - **Delete**: ❌ No

---

## 4. Testa l'API

Dopo aver creato le collezioni, testa che funzionino:

```bash
# Leggi tutte le claims (dovrebbe essere vuoto)
curl http://localhost:8055/items/claims

# Crea una claim di test (richiede autenticazione)
curl -X POST http://localhost:8055/items/claims \
  -H "Content-Type: application/json" \
  -d '{"content": "Test claim", "type": "pro", "author": "test"}'
```

---

## 5. Genera i Tipi TypeScript

Una volta create le collezioni, esegui:

```bash
npm run schema:generate
```

Questo creerà automaticamente i tipi TypeScript in `src/lib/generated-types.ts` basati sullo schema Directus.

---

## Note

- Il setup manuale è più veloce per la prima volta
- Una volta che le collezioni esistono, puoi esportare lo schema e usare `schema:apply` per altri ambienti
- I permessi possono essere raffinati successivamente in base alle esigenze
