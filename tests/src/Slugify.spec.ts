import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Slugify,
} from '../../index.ts';
import {
	defaultRuleProvider,
} from '../generated/defaultRuleProvider.ts';

void describe(Slugify.name, () => {
	void describe('::slugify()', () => {
		defaultRuleProvider.forEach(([input, expectation], i) => {
			void it(
				`behaves as expected with defaultRuleProvider[${i}]`,
				async () => {
					const instance = new Slugify();

					const result = instance.slugify(input);

					await assert.doesNotReject(result);

					const actual = await result;

					assert.equal(actual, expectation);
				},
			);
		});
	});
});
