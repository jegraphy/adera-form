const assert = require('node:assert/strict');
const { registrationTotal, TICKETS, escapeHTML } = require('../public/app.js');
const expected = { standard3: 450, standard2: 400, standard1: 250, reduced: 130, du: 82, speaker: 0, vip: 0, guest: 0, committee: 0, studentStaff: 0 };
assert.deepEqual(Object.keys(TICKETS), Object.keys(expected));
for (const [ticket, price] of Object.entries(expected)) {
  assert.equal(registrationTotal(ticket, 'no'), price);
  assert.equal(registrationTotal(ticket, 'yes'), price + 75);
}
for (const ticket of ['', 'unknown', '__proto__', 'toString']) assert.throws(() => registrationTotal(ticket, 'no'));
assert.throws(() => registrationTotal('standard3', ''));
assert.equal(escapeHTML('<img src=x onerror="alert(1)"> & Camille'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; Camille');
console.log('OK: 10 tariffs, gala totals, invalid selections, and summary escaping.');
