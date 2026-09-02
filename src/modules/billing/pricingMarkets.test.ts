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

assert.equal(resolvePricingMarket('CA').plans.smart.monthly, 999);
assert.equal(resolvePricingMarket('CA').plans.smart.yearly, 9990);
assert.equal(resolvePricingMarket('CA').plans.premium.monthly, 1999);
assert.equal(resolvePricingMarket('CA').plans.premium.yearly, 19990);
assert.equal(resolvePricingMarket('US').plans.smart.monthly, 750);
assert.equal(resolvePricingMarket('US').plans.premium.monthly, 1499);
assert.equal(resolvePricingMarket('US').plans.premium.yearly, 14990);
assert.equal(resolvePricingMarket('EU').plans.smart.monthly, 650);
assert.equal(resolvePricingMarket('EU').plans.smart.yearly, 6500);
assert.equal(resolvePricingMarket('EU').plans.premium.monthly, 1299);
assert.equal(resolvePricingMarket('EU').plans.premium.yearly, 12990);
assert.equal(resolvePricingMarket('TN').plans.smart.monthly, 750);

const ca = resolveCheckoutPrice('CA', 'smart', 'monthly');
assert.equal(ca.envKey, 'STRIPE_PRICE_SMART_MONTHLY_CAD');
assert.equal(ca.chargeAmountMinor, 999);
assert.equal(ca.chargeDiffersFromDisplay, false);

const tn = resolveCheckoutPrice('TN', 'premium', 'yearly');
assert.equal(tn.displayCurrency, 'USD');
assert.equal(tn.chargeCurrency, 'USD');
assert.equal(tn.displayAmountMinor, 14990);
assert.equal(tn.chargeAmountMinor, 14990);
assert.equal(tn.envKey, 'STRIPE_PRICE_PREMIUM_YEARLY_USD');
assert.equal(tn.chargeDiffersFromDisplay, false);

assert.equal(stripePriceEnvKey('premium', 'yearly', 'eur'), 'STRIPE_PRICE_PREMIUM_YEARLY_EUR');

console.log('pricingMarkets tests passed');
