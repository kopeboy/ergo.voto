# Configurazione Permessi Directus (Access Policies)

Directus 11 usa **Access Policies** invece di Access Control. Ecco come configurarli:

## 1. Permessi Pubblici (Utenti Non Autenticati)

### Per la collezione `claims`:

1. Vai su **Settings** → **Access Policies**
2. Clicca sulla policy **"Public"**
3. Nella sezione **Permissions**, trova o aggiungi la collezione `claims`
4. Configura:
   - **Read**: ✅ **All Access**
   - **Create**: ❌ **No Access**
   - **Update**: ❌ **No Access**
   - **Delete**: ❌ **No Access**

### Per la collezione `votes`:

1. Nella stessa policy **"Public"**, trova o aggiungi `votes`
2. Configura:
   - **Read**: ✅ **All Access** (per vedere i conteggi aggregati)
   - **Create**: ❌ **No Access** (richiedi autenticazione per votare)
   - **Update**: ❌ **No Access**
   - **Delete**: ❌ **No Access**

---

## 2. Crea Ruolo "User" per Utenti Autenticati

### Crea il ruolo:

1. Vai su **Settings** → **User Roles**
2. Clicca **"Create Role"**
3. Nome: `User`
4. Descrizione: "Utenti registrati che possono creare claims"
5. Icona: `person`
6. **Salva**

### Crea Access Policy per il ruolo User:

1. Vai su **Settings** → **Access Policies**
2. Clicca **"Create Access Policy"**
3. Configura:
   - **Name**: `User Policy`
   - **Roles**: Seleziona `User`
   - **Salva**

### Configura permessi per `claims`:

1. Nella policy appena creata, aggiungi la collezione `claims`
2. **Read**: ✅ **All Access**
3. **Create**: ✅ **All Access**
4. **Update**: ✅ **Custom Access**
   - Clicca su **"Custom Access"**
   - Nella sezione **Item Permissions**, aggiungi un filtro:
   - **Field**: `user_created`
   - **Operator**: `equals` (=)
   - **Value**: `$CURRENT_USER` (seleziona dalla dropdown "Special Values")
   - Questo permette agli utenti di modificare solo i propri claims
5. **Delete**: ❌ **No Access** (solo admin possono eliminare)

### Configura permessi per `votes`:

1. Aggiungi la collezione `votes` alla stessa policy
2. **Read**: ✅ **All Access**
3. **Create**: ✅ **All Access** (utenti autenticati possono votare)
4. **Update**: ✅ **Custom Access**
   - **Field**: `user_updated`
   - **Operator**: `equals`
   - **Value**: `$CURRENT_USER`
   - Questo permette agli utenti di modificare i propri voti esistenti
5. **Delete**: ❌ **No Access**

---

## 3. Gestione Voti Multipli (Upsert Logic)

Invece di prevenire voti duplicati, permettiamo agli utenti di **aggiornare** i propri voti esistenti.

### Logica Frontend (Upsert):

Quando un utente vota:

1. **Controlla** se esiste già un voto dell'utente per quella claim
2. **Se esiste**: aggiorna il voto esistente (PATCH)
3. **Se non esiste**: crea un nuovo voto (POST)

Esempio di implementazione nel frontend:

```typescript
async function vote(claimId: string, dimension: 'accuracy' | 'relevance', value: number) {
  // 1. Cerca voto esistente
  const existingVotes = await directus.request(
    readItems('votes', {
      filter: {
        claim_id: { _eq: claimId },
        user_updated: { _eq: '$CURRENT_USER' }
      },
      limit: 1
    })
  );

  if (existingVotes.length > 0) {
    // 2. Aggiorna voto esistente
    await directus.request(
      updateItem('votes', existingVotes[0].id, {
        [dimension]: value
      })
    );
  } else {
    // 3. Crea nuovo voto
    await directus.request(
      createItem('votes', {
        claim_id: claimId,
        accuracy: dimension === 'accuracy' ? value : 0,
        relevance: dimension === 'relevance' ? value : 0
      })
    );
  }
}
```

### Vantaggi di questo approccio:

- ✅ Gli utenti possono cambiare idea e modificare i loro voti
- ✅ Non serve vincolo unico nel database
- ✅ Più flessibile per future funzionalità (es. rimuovere voto)
- ✅ Traccia modifiche con `user_updated` e `date_updated`

---

## 4. Configurazione Campi Auto-Popolati

Assicurati che i campi `user_created` e `date_created` siano configurati correttamente:

### Per `claims`:

1. Vai su **Settings** → **Data Model** → `claims`
2. Campo `user_created`:
   - **Interface**: `Select User` (M2O)
   - **Special**: `user-created`
   - **On Create**: Save Current User ID
   - **On Update**: Do Nothing
3. Campo `date_created`:
   - **Special**: `date-created`
   - **Read Only**: ✅ Yes

### Per `votes`:

Stessa configurazione di `claims` per i campi `user_created` e `date_created`.

---

## 5. Registrazione Utenti (Opzionale)

Se vuoi permettere la registrazione pubblica:

1. Vai su **Settings** → **Project Settings**
2. Nella sezione **Public Registration**:
   - **Enable Public Registration**: ✅ Yes
   - **Default Role**: Seleziona `User`
   - **Verify Email**: ✅ Yes (consigliato)

---

## 6. Test dei Permessi

### Test come utente pubblico (non autenticato):

```bash
# Leggi claims (dovrebbe funzionare)
curl http://localhost:8055/items/claims

# Crea claim (dovrebbe fallire)
curl -X POST http://localhost:8055/items/claims \
  -H "Content-Type: application/json" \
  -d '{"content": "Test", "type": "pro"}'
```

### Test come utente autenticato:

```bash
# Login
curl -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}' \
  > token.json

# Estrai token
TOKEN=$(cat token.json | jq -r '.data.access_token')

# Crea claim (dovrebbe funzionare)
curl -X POST http://localhost:8055/items/claims \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": "Test claim autenticato", "type": "pro"}'

# Vota (dovrebbe funzionare)
curl -X POST http://localhost:8055/items/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"claim_id": "CLAIM_ID_QUI", "accuracy": 1, "relevance": 1}'
```

---

## Riepilogo Configurazione

| Collezione | Pubblico Read | Pubblico Create | User Read | User Create | User Update | User Delete |
|------------|---------------|-----------------|-----------|-------------|-------------|-------------|
| `claims`   | ✅ All        | ❌ No           | ✅ All    | ✅ All      | ✅ Own only | ❌ No       |
| `votes`    | ✅ All        | ❌ No           | ✅ All    | ✅ All      | ✅ Own only | ❌ No       |

**Note:**
- **Voti richiedono autenticazione** (no voti anonimi per prevenire spam/bot)
- `user_updated` viene popolato automaticamente da Directus ad ogni modifica
- `date_updated` si aggiorna automaticamente
- Gli utenti possono modificare i propri voti esistenti (upsert logic)
- Solo gli admin possono eliminare claims e votes
