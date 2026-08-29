import assert from 'node:assert/strict';
import { isWhitelistedPriceId } from './stripeClient';

// Without env price IDs configured, whitelist must reject arbitrary client values.
assert.equal(isWhitelistedPriceId('price_fake_from_browser'), false);
assert.equal(isWhitelistedPriceId(''), false);

console.log('stripeClient whitelist tests passed');
