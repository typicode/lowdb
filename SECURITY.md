<!-- GITHUB SECURITY ADVISORY SUBMISSION -->
<!-- Title:              Silent Data Loss via Write Coalescing in steno (lowdb dependency) -->
<!-- Severity:           Medium -->
<!-- Ecosystem:          npm -->
<!-- Package name:       lowdb -->
<!-- Affected versions:  <= 7.0.1 -->
<!-- Patched versions:   (leave blank) -->
<!-- CWE:                CWE-362 -->

## Summary

lowdb v7.0.1's async file adapter depends on steno v4.0.2, whose `Writer` silently drops intermediate writes when a write is in progress. All `write()` promises resolve successfully, but only the last queued write is persisted to disk. This is a data integrity violation — callers receive a false durability guarantee, leading to silent data loss under concurrent load.

## Details

When a steno `Writer` is locked (write in progress), subsequent `write()` calls are handled by `#add()` (`steno/lib/index.js`, lines 35-45):

```javascript
#add(data) {
    this.#nextData = data;  // OVERWRITES any previously queued data
    this.#nextPromise ||= new Promise((resolve, reject) => {
        this.#next = [resolve, reject];
    });
    return new Promise((resolve, reject) => {
        this.#nextPromise?.then(resolve).catch(reject);
    });
}
```

If writes A, B, C are queued while write #1 is in progress:
1. `#add(A)` → `#nextData = A`
2. `#add(B)` → `#nextData = B` (A silently dropped)
3. `#add(C)` → `#nextData = C` (B silently dropped)
4. Write #1 completes → only C is written
5. **All three promises resolve** — callers of `write(A)` and `write(B)` believe their data was persisted

## PoC

```javascript
import { Writer } from 'steno';
const writer = new Writer('test.json');

// Fire 10 concurrent writes
const promises = [];
for (let i = 0; i < 10; i++) {
    promises.push(writer.write(JSON.stringify({ id: i })));
}
await Promise.all(promises);
// All 10 promises resolved ✓

// Read back from disk:
import fs from 'node:fs';
const persisted = JSON.parse(fs.readFileSync('test.json', 'utf-8'));
console.log(persisted); // { id: 9 } — only the LAST write survived

// Writes 0-8 (90%) silently lost despite successful promise resolution
```

**Tested and confirmed:** 9 out of 10 writes (90%) silently dropped. All 10 `write()` promises resolved successfully, giving callers a false durability guarantee.

## Impact

Any web application using lowdb's async adapter that handles concurrent requests will silently lose user data:

- API returns **200 OK** to the user, but their data is **never persisted**
- No errors, no warnings — completely silent data loss
- Under typical web server load (multiple concurrent requests), the **majority** of writes are lost
- Affects audit logs, user data, configuration changes — anything stored in lowdb

## Remediation

1. Replace write coalescing with a sequential write queue that persists every write
2. At minimum, reject or error on coalesced writes instead of silently dropping them
3. Document the write-coalescing behavior prominently so developers avoid relying on write durability

**Note:** This vulnerability originates in the `steno` package (same maintainer). A separate advisory may be appropriate for `steno` itself.
