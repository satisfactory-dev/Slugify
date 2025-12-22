import type {
} from 'regexp.escape/auto';

import strtr from 'locutus/php/strings/strtr.js';

import {
	DefaultRuleProvider,
} from '../generated-src/DefaultRuleProvider.ts';

import type {
	RuleProviderInterface,
	Rules,
} from './RuleProvider/RuleProviderInterface.ts';


export class Slugify {
	#activated_rulesets_pending: Set<string>;

	#provider: RuleProviderInterface;

	#rules: Rules = {};

	#separator: string = '-';

	constructor(
		{
			rulesets,
		}: {
			rulesets?: [string, ...string[]],
		} = {},
		provider?: RuleProviderInterface,
	) {
		this.#activated_rulesets_pending = new Set();

		for (const ruleset_name of (
			rulesets || DefaultRuleProvider.provided_rulesets())
		) {
			this.#activated_rulesets_pending.add(ruleset_name);
		}

		this.#provider = provider || new DefaultRuleProvider();
	}

	addRule(look_for: string, replace_with_this: string): this {
		this.#rules[look_for] = replace_with_this;

		return this;
	}

	addRules(rules: Rules): this {
		for (const [look_for, replace_with_this] of Object.entries(rules)) {
			this.addRule(look_for, replace_with_this);
		}

		return this;
	}

	async slugify(value: string): Promise<string> {
		for (const ruleset_name of [...this.#activated_rulesets_pending]) {
			const rules = await this.#provider.getRules(ruleset_name);

			this.addRules(rules);

			this.#activated_rulesets_pending.delete(ruleset_name);
		}

		let result = value;

		result = strtr(result, this.#rules);

		result = result.toLowerCase();

		result = result
			.replace(/[^A-Za-z0-9]+/g, this.#separator);

		if (result.startsWith(this.#separator)) {
			result = result.replace(
				new RegExp(`^(?:${RegExp.escape(this.#separator)})+`),
				'',
			);
		}
		if (result.endsWith(this.#separator)) {
			result = result.replace(
				new RegExp(`(?:${RegExp.escape(this.#separator)})+$`),
				'',
			);
		}

		return result;
	}
}
