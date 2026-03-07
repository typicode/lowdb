<!-- GITHUB SECURITY ADVISORY SUBMISSION -->
<!-- Title:              Path Traversal via Unsanitized Filename in lowdb Adapter Constructor -->
<!-- Severity:           High -->
<!-- Ecosystem:          npm -->
<!-- Package name:       lowdb -->
<!-- Affected versions:  <= 7.0.1 -->
<!-- Patched versions:   (leave blank) -->
<!-- CWE:                CWE-22 -->

## Summary

lowdb v7.0.1's file-based adapter constructors (`TextFile`, `JSONFile`, `DataFile`) accept a `filename` parameter with zero path validation or sanitization. If any user input influences the database filename, an attacker can read or overwrite arbitrary files on the filesystem via directory traversal or absolute path injection.

## Details

The `TextFile` adapter constructor (`lib/adapters/node/TextFile.js`, lines 8-10) stores the filename verbatim:

```javascript
constructor(filename) {
    this.#filename = filename;  // Stored verbatim — no validation
    this.#writer = new Writer(filename);
}
```

There is no:
- Path normalization or canonicalization
- Rejection of `..` traversal sequences
- Base-directory restriction
- Rejection of absolute paths

The `JSONFilePreset` convenience function (`lib/presets/node.js`, line 4) passes the filename directly through:

```javascript
export async function JSONFilePreset(filename, defaultData) {
    const adapter = new JSONFile(filename);  // No validation
```

Additionally, steno's `Writer` creates a `.tmp` file in the same directory as the target (`steno/lib/index.js`, lines 6-8), so traversal attacks also create attacker-controlled temp files in arbitrary directories.

## PoC

```javascript
import { JSONFilePreset } from 'lowdb/node';

// Scenario: Multi-tenant app creates per-user databases
// const db = await JSONFilePreset(`databases/${username}.json`, { notes: [] });

// Attack 1 — Absolute path injection:
const db = await JSONFilePreset('/tmp/lowdb_absolute_injection.json', { pwned: true });
await db.write();
// Result: File created at /tmp/lowdb_absolute_injection.json ✓

// Attack 2 — Relative traversal:
// username = "../../../etc/cron.d/backdoor"
// Creates/overwrites /etc/cron.d/backdoor.json

// Attack 3 — Read arbitrary files:
// username = "../../../etc/passwd"
// lowdb tries to JSON.parse /etc/passwd → error may leak file contents
```

**Tested and confirmed:** Successfully wrote to `/tmp/lowdb_absolute_injection.json` via absolute path injection. Source analysis confirms zero path validation in `TextFile`, `DataFile`, and `JSONFile` constructors.

## Impact

Applications that derive lowdb filenames from user input (per-user databases, tenant-specific files, config selection) are vulnerable to:

- **Arbitrary file write** — overwrite config files, crontabs, authorized_keys
- **Arbitrary file read** — error messages from `JSON.parse` failures can leak file contents
- **Temp file creation** in arbitrary directories via steno's `.tmp` file side-effect

## Remediation

Add path validation in the adapter constructor:

```javascript
import path from 'node:path';

constructor(filename) {
    const str = filename.toString();
    if (str.includes('..') || path.isAbsolute(str)) {
        throw new Error('lowdb: path traversal detected');
    }
    this.#filename = path.resolve(filename);
    this.#writer = new Writer(this.#filename);
}
```
