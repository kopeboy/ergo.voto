# Ottimizzazione Performance - Sistema di Voto

## 🎯 Problema

La logica upsert richiede una query SELECT prima di ogni voto per controllare se l'utente ha già votato:

```typescript
// ⚠️ 1 query per ogni voto
const existingVotes = await directus.request(
  readItems('votes', { filter: { claim_id, user_updated } })
);
```

**Impatto:**
- Utente vota 10 volte = 10 query SELECT extra
- Con indici: ~10-20ms per query
- Overhead totale: ~100-200ms (accettabile ma non ottimale)

---

## ✅ Soluzione: Cache Locale dei Voti

### Strategia

1. **Al login**: Carica TUTTI i voti dell'utente in una volta sola
2. **Durante la sessione**: Usa la cache locale (zero query extra)
3. **Al voto**: Aggiorna cache + database
4. **Al logout**: Pulisci cache

### Implementazione

**File:** `src/lib/stores/votes.ts`

```typescript
import { voteWithCache, loadUserVotes } from '$lib/stores/votes';

// 1. Al login dell'utente
await loadUserVotes(); // 1 query che carica TUTTI i voti

// 2. Durante la sessione (zero query extra!)
await voteWithCache(claimId, 'accuracy', 1);
await voteWithCache(claimId2, 'relevance', -1);
// ... vota quanto vuoi, nessuna query SELECT extra
```

### Vantaggi

| Metodo | Query per 10 voti | Latenza totale |
|--------|-------------------|----------------|
| **Senza cache** | 10 SELECT + 10 INSERT/UPDATE = 20 query | ~200-400ms |
| **Con cache** | 0 SELECT + 10 INSERT/UPDATE = 10 query | ~100-200ms |

**Risparmio: 50% delle query!** 🚀

---

## 📊 Confronto Approcci

### Opzione 1: Cache Locale (Implementata) ⭐

**Pro:**
- ✅ Zero query extra durante il voto
- ✅ Risposta istantanea nell'UI
- ✅ Funziona offline (con sync successiva)
- ✅ Semplice da implementare

**Contro:**
- ⚠️ Richiede 1 query iniziale al login
- ⚠️ Memoria client: ~1KB per 100 voti (trascurabile)

**Quando usare:**
- ✅ Sempre (approccio consigliato)
- ✅ Utenti che votano frequentemente
- ✅ App con molte interazioni

### Opzione 2: Query Diretta (Fallback)

**Pro:**
- ✅ Nessuna gestione cache
- ✅ Sempre sincronizzato con DB

**Contro:**
- ❌ 1 query extra per ogni voto
- ❌ Latenza maggiore

**Quando usare:**
- Solo se l'utente vota raramente (<5 voti per sessione)
- Implementazione rapida/prototipo

### Opzione 3: Vincolo Unico + Try/Catch

```typescript
// Prova a creare, se fallisce (duplicate) allora aggiorna
try {
  await createItem('votes', { claim_id, accuracy, relevance });
} catch (error) {
  if (error.code === 'DUPLICATE') {
    await updateItem('votes', existingId, { accuracy, relevance });
  }
}
```

**Pro:**
- ✅ Zero query SELECT

**Contro:**
- ❌ Richiede vincolo unico nel DB (non disponibile facilmente in Directus)
- ❌ Logica basata su errori (anti-pattern)
- ❌ Non funziona senza vincolo DB

---

## 🔧 Ottimizzazioni Database

### 1. Indici Composti

Assicurati che Directus abbia indici su:

```sql
CREATE INDEX idx_votes_claim_user ON votes(claim_id, user_updated);
```

Questo rende la query di lookup **10-100x più veloce**.

### 2. Aggregazione Voti

Per mostrare i conteggi totali, usa aggregazioni invece di caricare tutti i voti:

```typescript
// ❌ Lento: carica tutti i voti e aggrega nel frontend
const votes = await readItems('votes', { filter: { claim_id } });
const total = votes.reduce((sum, v) => sum + v.accuracy, 0);

// ✅ Veloce: aggrega nel database
const result = await directus.request(
  aggregate('votes', {
    aggregate: { sum: ['accuracy', 'relevance'] },
    groupBy: ['claim_id'],
    query: { filter: { claim_id } }
  })
);
```

### 3. Caching HTTP

Configura header di cache per i voti aggregati:

```typescript
// In SvelteKit +server.ts
export const GET = async ({ params, setHeaders }) => {
  const votes = await getClaimVotes(params.id);
  
  setHeaders({
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
  });
  
  return json(votes);
};
```

---

## 📈 Metriche Attese

### Scenario: Utente vota su 20 claims in una sessione

| Metodo | Query Totali | Tempo Totale | Memoria |
|--------|--------------|--------------|---------|
| **Senza cache** | 40 (20 SELECT + 20 INSERT) | ~400-800ms | 0 KB |
| **Con cache** | 21 (1 SELECT iniziale + 20 INSERT) | ~200-400ms | ~2 KB |

**Miglioramento: 47% più veloce, 19 query risparmiate** 🎉

---

## 🚀 Implementazione Raccomandata

### 1. Setup iniziale (una volta)

```typescript
// src/routes/+layout.svelte
import { loadUserVotes } from '$lib/stores/votes';
import { onMount } from 'svelte';

onMount(async () => {
  const user = await getCurrentUser();
  if (user) {
    await loadUserVotes(); // Carica cache
  }
});
```

### 2. Usa nei componenti

```typescript
// src/lib/components/ClaimNode.svelte
import { voteWithCache } from '$lib/stores/votes';

async function handleVote(dimension, value) {
  await voteWithCache(claim.id, dimension, value);
  // UI si aggiorna automaticamente tramite store
}
```

### 3. Cleanup al logout

```typescript
import { clearVotesCache } from '$lib/stores/votes';

async function logout() {
  clearVotesCache();
  // ... resto della logica di logout
}
```

---

## 🎓 Best Practices

1. **Carica cache al login** - 1 query iniziale risparmia decine di query successive
2. **Usa store Svelte** - Reattività automatica nell'UI
3. **Aggrega nel DB** - Non caricare tutti i voti per contare
4. **Indici corretti** - Velocizzano le query di 10-100x
5. **Cache HTTP** - Riduci chiamate API per dati pubblici

---

## 📝 Conclusione

**Raccomandazione:** Usa sempre la **cache locale** (`voteWithCache`).

- ✅ 50% query in meno
- ✅ 47% più veloce
- ✅ Migliore UX (istantaneo)
- ✅ Scalabile (funziona con 1000+ voti)

L'overhead di memoria è trascurabile (~1KB per 100 voti) e i benefici in performance sono significativi.
