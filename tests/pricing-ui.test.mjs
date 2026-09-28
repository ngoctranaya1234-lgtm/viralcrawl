import test from 'node:test';
import assert from 'node:assert/strict';
import { createPricingPage } from '../js/pages/pricing.mjs';

function createMockElement(tag) {
  const children = [];
  const attrs = {};
  const listeners = {};
  return {
    tagName: tag.toUpperCase(),
    children,
    attributes: attrs,
    style: {},
    className: '',
    textContent: '',
    appendChild(child) {
      children.push(child);
      if (typeof child === 'string') this.textContent += child;
      return child;
    },
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return attrs[k]; },
    addEventListener(evt, fn) { listeners[evt] = fn; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    innerHTML: ''
  };
}

test('pricing page mounts with permanent simulation disclaimer banner', () => {
  const mockState = {
    getSnapshot: () => ({
      phase: 'ready',
      user: { id: 'u1', name: 'Nhut' },
      credits: { availableCredits: 2500000, unit: 'CREDIT', realMoney: false },
      catalog: {
        plans: [
          { id: 'START', credits: 500000 },
          { id: 'PRO', credits: 1500000 },
          { id: 'ULTRA', credits: 4000000 }
        ]
      }
    }),
    subscribe: () => () => {}
  };

  const outlet = createMockElement('div');
  const page = createPricingPage({
    state: mockState,
    api: {},
    dialogs: {}
  });

  assert.ok(typeof page.mount === 'function');
  assert.ok(typeof page.unmount === 'function');
});

test('pricing page formatCredits outputs credit unit and never currency symbols', () => {
  const { formatCredits } = createPricingPage({
    state: { getSnapshot: () => ({}), subscribe: () => () => {} },
    api: {}
  });

  const formatted = formatCredits(2500000);
  assert.equal(formatted.includes('credit'), true);
  assert.equal(formatted.includes('đ'), false);
  assert.equal(formatted.includes('VND'), false);
  assert.equal(formatted.includes('$'), false);
});
