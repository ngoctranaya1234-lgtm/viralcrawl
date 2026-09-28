import test from 'node:test';
import assert from 'node:assert/strict';
import { CHECKOUT_THEMES, SIMULATION_BANNER_TEXT, validateTheme } from '../js/checkout-themes.mjs';

test('CHECKOUT_THEMES defines exactly the seven approved simulation themes and is immutable', () => {
  const expectedIds = ['momo', 'mbbank', 'techcombank', 'sacombank', 'visa', 'applepay', 'googlepay'];
  assert.equal(CHECKOUT_THEMES.length, 7);

  const actualIds = CHECKOUT_THEMES.map(t => t.id);
  assert.deepEqual(actualIds.sort(), expectedIds.sort());

  for (const theme of CHECKOUT_THEMES) {
    assert.ok(theme.id, 'Theme must have an id');
    assert.ok(theme.label, 'Theme must have a label');
    assert.ok(theme.accent, 'Theme must have an accent color');
    assert.ok(theme.icon, 'Theme must have an icon');
    assert.ok(Object.isFrozen(theme), 'Each theme item must be frozen');
  }

  assert.ok(Object.isFrozen(CHECKOUT_THEMES), 'CHECKOUT_THEMES list must be frozen');
});

test('SIMULATION_BANNER_TEXT is the exact required disclaimer', () => {
  assert.equal(SIMULATION_BANNER_TEXT, 'NỘI BỘ / MÔ PHỎNG — ĐIỂM ẢO — KHÔNG CHUYỂN HOẶC RÚT TIỀN THẬT');
});

test('validateTheme accepts only approved themes and rejects unknowns safely', () => {
  assert.equal(validateTheme('momo')?.id, 'momo');
  assert.equal(validateTheme('visa')?.id, 'visa');
  assert.equal(validateTheme('fakebank'), null);
  assert.equal(validateTheme(''), null);
  assert.equal(validateTheme(null), null);
});

test('theme definitions contain zero financial, real-wallet, or banking data fields', () => {
  const forbiddenKeys = ['accountNumber', 'cardNumber', 'cvv', 'otp', 'password', 'qrUrl', 'bankCode', 'vnd', 'usd', 'đ'];
  const jsonStr = JSON.stringify(CHECKOUT_THEMES).toLowerCase();

  for (const forbidden of forbiddenKeys) {
    assert.ok(!jsonStr.includes(forbidden.toLowerCase()), `Theme definition must not contain "${forbidden}"`);
  }
});
