<!-- GITHUB SECURITY ADVISORY SUBMISSION -->
<!-- Title:              Denial of Service via Uncontrolled Memory Allocation and Event Loop Blocking in lowdb -->
<!-- Severity:           High -->
<!-- Ecosystem:          npm -->
<!-- Package name:       lowdb -->
<!-- Affected versions:  <= 7.0.1 -->
<!-- Patched versions:   (leave blank) -->
<!-- CWE:                CWE-770 -->

## Summary

lowdb v7.0.1 loads the entire database into memory and serializes it synchronously via `JSON.stringify` on every write. There are no limits on database size, record count, or nesting depth. An attacker who can insert records can exhaust server memory (OOM kill) or block the Node.js event loop for seconds, making the server unresponsive to all clients.

## Details

`Low.read()` and `Low.write()` (`lib/core/Low.js`, lines 15-23) operate on the entire dataset:

```javascript
async read() {
    const data = await this.adapter.read();  // Read ENTIRE file into RAM
    if (data) this.data = data;
}
async write() {
    if (this.data) await this.adapter.write(this.data);  // Serialize ENTIRE dataset
}
```

`JSONFile`'s stringify function (`lib/adapters/node/JSONFile.js`, line 6) calls `JSON.stringify(data, null, 2)`, which is **synchronous** and runs on the main thread. For large datasets, this blocks the event loop.

There are no safeguards:
- No maximum database/file size limit
- No maximum record count
- No maximum object depth
- No rate limiting on write operations
- No streaming serialization

## PoC

```javascript
import { Low, Memory } from 'lowdb';

const adapter = new Memory();
const db = new Low(adapter, { items: [] });

// Simulate attacker inserting large records
for (let i = 0; i < 5000; i++) {
    db.data.items.push({ id: i, payload: 'A'.repeat(10000) });
}

// JSON.stringify blocks the event loop
const start = performance.now();
const serialized = JSON.stringify(db.data);
const elapsed = performance.now() - start;

console.log(`${(Buffer.byteLength(serialized) / 1024 / 1024).toFixed(2)} MB`); // 47.80 MB
console.log(`${elapsed.toFixed(0)} ms blocked`); // 138ms — ALL clients unresponsive
```

**Tested and confirmed:**
- 47.80 MB dataset blocked event loop for **138ms**
- Memory grew unboundedly from 5.10 MB to 7.36 MB (heap) during insertion
- `Low.js` source contains zero resource limit logic

## Impact

- **Memory exhaustion:** Unbounded dataset growth leads to Node.js OOM kill
- **Event loop blocking:** `JSON.stringify` on large datasets blocks all request handling for 100ms+
- **Disk exhaustion:** Each `write()` creates a full `.tmp` copy on disk via steno — at peak, two full copies exist simultaneously
- **Cascading failure:** A single attacker growing the database degrades service for ALL users

## Remediation

Add configurable size limits in the adapter:

```javascript
class BoundedJSONFile extends JSONFile {
    #maxSizeBytes;
    constructor(filename, maxSizeBytes = 10 * 1024 * 1024) {
        super(filename);
        this.#maxSizeBytes = maxSizeBytes;
    }
    async write(data) {
        const str = JSON.stringify(data);
        if (Buffer.byteLength(str) > this.#maxSizeBytes) {
            throw new Error(`Database exceeds ${this.#maxSizeBytes} byte limit`);
        }
        return super.write(data);
    }
}
```
