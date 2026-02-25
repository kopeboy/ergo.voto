# Configurazione Permessi Pubblici Directus

## Problema
Quando non sei loggato, ricevi errori 401 (Unauthorized) perché Directus richiede autenticazione per leggere debates e claims.

## Soluzione: Permessi Pubblici

Segui questi passaggi per permettere la lettura pubblica di debates e claims:

### 1. Vai ai Permessi del Ruolo "Public"

1. Login su http://localhost:8055 come admin
2. **Settings** → **Roles & Permissions**
3. Clicca sul ruolo **"Public"** (icona globo 🌐)

### 2. Configura Permessi per "debates"

1. Trova la collezione **`debates`**
2. Clicca sull'icona **"Read"** (occhio 👁️)
3. Seleziona **"All Access"** oppure configura filtro:
   ```json
   {
     "status": {
       "_eq": "published"
     }
   }
   ```
4. **Field Permissions**: Seleziona tutti i campi necessari:
   - ✅ `id`
   - ✅ `title`
   - ✅ `description`
   - ✅ `question`
   - ✅ `status`
   - ✅ `date_created`
   - ✅ `date_updated`
   - ✅ `user_updated`
5. **Save**

### 3. Configura Permessi per "claims"

1. Trova la collezione **`claims`**
2. Clicca sull'icona **"Read"** (occhio 👁️)
3. Seleziona **"All Access"** (per ora, filtreremo dopo)
4. **Field Permissions**: Seleziona tutti i campi:
   - ✅ `id`
   - ✅ `debate_id`
   - ✅ `content`
   - ✅ `type`
   - ✅ `parent_id`
   - ✅ `status`
   - ✅ `citations`
   - ✅ `is_ergo`
   - ✅ `date_created`
   - ✅ `date_updated`
   - ✅ `user_updated`
5. **Save**

### 4. Configura Permessi per "votes" (Solo Lettura dei Totali)

1. Trova la collezione **`votes`**
2. Clicca sull'icona **"Read"** (occhio 👁️)
3. Seleziona **"All Access"**
4. **Field Permissions**: Seleziona:
   - ✅ `id`
   - ✅ `claim_id`
   - ✅ `dimension`
   - ✅ `value`
   - ❌ `user_created` (NO - privacy)
5. **Save**

### 5. Verifica

Dopo aver configurato i permessi:
1. **Logout** da Directus
2. Vai su http://localhost:5173
3. Dovresti vedere i dibattiti senza errori 401
4. Clicca su un dibattito - dovresti vedere le claims

### 6. Permessi per Utenti Autenticati

Gli utenti autenticati (ruolo "User") devono poter:
- **Leggere** tutto (come Public)
- **Creare** claims e votes
- **Aggiornare** solo le proprie claims/votes

Configura il ruolo **"User"**:
1. **claims**: 
   - Read: All Access
   - Create: All Access
   - Update: Solo proprie (`user_updated._eq.$CURRENT_USER`)
2. **votes**:
   - Read: All Access
   - Create: All Access
   - Update: Solo propri (`user_created._eq.$CURRENT_USER`)

## Note Importanti

- **Public** = utenti NON autenticati (anonimi)
- **User** = utenti autenticati
- I permessi Public sono necessari per navigare il sito senza login
- I permessi User sono necessari per votare e creare claims

## Test Rapido

```bash
# Test lettura pubblica debates
curl http://localhost:8055/items/debates

# Test lettura pubblica claims
curl http://localhost:8055/items/claims

# Entrambi dovrebbero restituire dati, non 401
```
