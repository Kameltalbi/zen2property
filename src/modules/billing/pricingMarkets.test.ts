import assert from 'node:assert/strict';
import {
  resolveCheckoutPrice,
  resolvePricingMarket,
  stripePriceEnvKey,
} from './pricingMarkets';

assert.equal(resolvePricingMarket('CA').id, 'CA');
assert.equal(resolvePricingMarket('CA').displayCurrency, 'CAD');
assert.equal(resolvePricingMarket('US').displayCurrency, 'USD');
assert.equal(resolvePricingMarket('FR').id, 'EU');
assert.equal(resolvePricingMarket('BE').displayCurrency, 'EUR');
assert.equal(resolvePricingMarket('TN').displayCurrency, 'USD');
assert.equal(resolvePricingMarket('TN').chargeCurrency, 'USD');
assert.equal(resolvePricingMarket('TN').chargeDiffersFromDisplay, false);
assert.equal(resolvePricingMarket('AU').id, 'OTHER');
assert.equal(resolvePricingMarket('AU').displayCurrency, 'USD');
assert.equal(resolvePricingMarket('').id, 'OTHER');

assert.equal(resolvePricingMarket('CA').plans.premium.monthly, 1499);
assert.equal(resolvePricingMarket('US').plans.premium.monthly, 999);
assert.equal(resolvePricingMarket('EU').plans.premium.monthly, 990);
assert.equal(resolvePricingMarket('TN').plans.premium.monthly, 999);

const ca = resolveCheckoutPrice('CA', 'premium', 'monthly');
assert.equal(ca.envKey, 'STRIPE_PRICE_PREMIUM_MONTHLY_CAD');
assert.equal(ca.chargeAmountMinor, 1499);
assert.equal(ca.chargeDiffersFromDisplay, false);

const tn = resolveCheckoutPrice('TN', 'pro', 'yearly');
assert.equal(tn.displayCurrency, 'USD');
assert.equal(tn.chargeCurrency, 'USD');
assert.equal(tn.displayAmountMinor, 19900);
assert.equal(tn.chargeAmountMinor, 19900);
assert.equal(tn.envKey, 'STRIPE_PRICE_PRO_YEARLY_USD');
assert.equal(tn.chargeDiffersFromDisplay, false);

assert.equal(stripePriceEnvKey('premium', 'yearly', 'eur'), 'STRIPE_PRICE_PREMIUM_YEARLY_EUR');

console.log('pricingMarkets tests passed');
