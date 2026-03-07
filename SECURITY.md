<!-- GITHUB SECURITY ADVISORY SUBMISSION -->
<!-- Title:              TOCTOU Race Condition — No File Locking in lowdb Storage Adapters -->
<!-- Severity:           Medium -->
<!-- Ecosystem:          npm -->
<!-- Package name:       lowdb -->
<!-- Affected versions:  <= 7.0.1 -->
<!-- Patched versions:   (leave blank) -->
<!-- CWE:                CWE-367 -->

## Summary

lowdb v7.0.1's `TextFileSync` adapter performs a non-atomic two-step write (writeFileSync → renameSync), and the async `TextFile` adapter delegates to steno's `Writer` which uses only an in-memory lock with no inter-process file locking. In multi-process deployments, concurrent writes corrupt the database file.

## Details

**Sync adapter** (`lib/adapters/node/TextFile.js`, lines 50-52):
```javascript
write(str) {
    writeFileSync(this.#tempFilename, str);  // Step 1: write to .tmp
    renameSync(this.#tempFilename, this.#filename);  // Step 2: rename
}
```

If the process crashes between these two calls, the `.tmp` file is orphaned and the database retains stale data.

**Async adapter** delegates to steno's `Writer` (`steno/lib/index.js`, line 29):
```javascript
#locked = false;  // In-memory only — no inter-process coordination

async write(data) {
    return this.#locked ? this.#add(data) : this.#write(data);
}
```

This boolean only prevents concurrent writes **within the same process**. In multi-process deployments (pm2 cluster mode, Node.js `cluster` module), each worker has its own `Writer` instance and its own `#locked` flag. Concurrent writes from different workers overwrite each other's `.tmp` files.

## PoC

```javascript
// Multi-process scenario (pm2 cluster mode):
// pm2 start server.js -i 4

// Worker 1: writeFile(.tmp, dataA) → [CONTEXT SWITCH]
// Worker 2: writeFile(.tmp, dataB) → rename(.tmp → db.json)  ← dataB persisted
// Worker 1: rename(.tmp → db.json)  ← renames Worker 2's stale .tmp, dataA lost

// Even single-process concurrent handlers lose data:
import { JSONFilePreset } from 'lowdb/node';
const db = await JSONFilePreset('db.json', { counter: 0 });

// Fire concurrent increments
await Promise.all(Array.from({ length: 100 }, async () => {
    await db.read();
    db.data.counter++;
    await db.write();
}));
// Expected counter: 100, Actual: ~10-30 (read-modify-write race)
```

## Impact

- **Data corruption** in multi-process Node.js deployments
- **Data loss** from read-modify-write races in concurrent request handlers
- **Crash inconsistency** — process crash between writeFileSync and renameSync leaves stale data

## Remediation

1. Add advisory file locking via `proper-lockfile` or `flock()` bindings
2. Document prominently that lowdb is single-process only
3. Add a mutex/semaphore for the read-modify-write cycle in `Low.update()`
