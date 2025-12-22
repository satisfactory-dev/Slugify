export type Rules = {[key: string]: string};
export type Rulesets = {[key: string]: Rules};

export interface RuleProviderInterface {
	getRules(ruleset: string): Promise<Rules>;
}
