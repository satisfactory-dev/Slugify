import type {
	Program,
} from 'php-parser';
import Array from 'php-parser/src/ast/array.js';
import type Block from 'php-parser/src/ast/block.js';
import Call from 'php-parser/src/ast/call.js';
import Class from 'php-parser/src/ast/class.js';
import type Declaration from 'php-parser/src/ast/declaration.js';
import type Expression from 'php-parser/src/ast/expression.js';
import Identifier from 'php-parser/src/ast/identifier.js';
import Name from 'php-parser/src/ast/name.js';
import Namespace from 'php-parser/src/ast/namespace.js';
import Number from 'php-parser/src/ast/number.js';
import type Property from 'php-parser/src/ast/property.js';
import PropertyStatement from 'php-parser/src/ast/propertystatement.js';
import String from 'php-parser/src/ast/string.js';
import Unary from 'php-parser/src/ast/unary.js';

export type substr = Call<Identifier<'substr'>, [
	(String|str_repeat),
	Number,
	Number|Unary<'-', Number>,
]>;
export type str_repeat = Call<Identifier<'str_repeat'>, [String, Number]>;

export function find_namespace<T extends string>(
	ast: Program,
	matching?: T,
): Namespace<T> {
	const result = (
		(ast as unknown as Block).children
	).find<Namespace<T>>((maybe): maybe is Namespace<T> => {
		return (
			maybe instanceof Namespace
			&& (
				undefined === matching
				|| matching === maybe.name
			)
		);
	});

	if (undefined === result) {
		throw new Error(`Could not find namespace${
			undefined === matching
				? '!'
				: ` "${matching}"`
		}`);
	}

	return result;
}

export function find_class<
	T extends string,
>(
	ast: Program,
	matching_namespace: string,
	matching_class: T,
): Class<T> {
	const namespace = find_namespace(ast, matching_namespace);

	const result = namespace.children.find((maybe): maybe is Class<T> => (
		maybe instanceof Class
		&& name_matches(matching_class, maybe.name)
	));

	if (undefined === result) {
		throw new Error(`Could not find ${
			matching_namespace
		}\\${
			matching_class
		}`);
	}

	return result;
}

export function find_in_class_body<
	T extends Declaration<string>,
>(
	ast: Program,
	matching_namespace: string,
	matching_class: string,
	predicate: (maybe: Declaration<string>) => maybe is T,
): T {
	const instance = find_class(ast, matching_namespace, matching_class);

	const result = instance.body.find(predicate);

	if (undefined === result) {
		throw new Error('Could not find what we\'re looking for!');
	}

	return result;
}

export function find_property_in_class<
	T extends Property,
>(
	ast: Program,
	matching_namespace: string,
	matching_class: string,
	predicate: (maybe: Property) => maybe is T,
): T {
	const in_class = find_class(
		ast,
		matching_namespace,
		matching_class,
	);

	for (const thing of in_class.body) {
		if (thing instanceof PropertyStatement) {
			const result = thing.properties.find<T>(predicate);

			if (result) {
				return result;
			}
		}
	}

	throw new Error('Could not find property matching predicate!');
}

export function name_matches<
	T extends string,
>(
	expecting: T,
	name: unknown,
): name is T|Identifier<T>|Name<T> {
	return (
		expecting === name
		|| (
			name instanceof Identifier
			&& expecting === name.name
		)
		|| (
			name instanceof Name
			&& expecting === name.name
		)
	);
}

export function is_array<
	T extends unknown[] = unknown[],
>(
	maybe: unknown,
	expected_length?: number,
	predicate?: (item: unknown, index: number) => boolean,
): maybe is Array<T> {
	if (!(maybe instanceof Array)) {
		return false;
	}

	if (
		undefined !== expected_length
		&& expected_length !== (maybe as Array).items.length
	) {
		return false;
	}

	if (predicate) {
		for (let i = 0; i < (maybe as Array).items.length; ++i) {
			if (!predicate((maybe as Array).items[i], i)) {
				return false;
			}
		}
	}

	return true;
}

export function is_unary<
	Type extends string,
	What extends Expression<string>,
>(
	maybe: unknown,
	type?: Type,
	predicate?: (value: unknown) => value is What,
): maybe is Unary<Type, What> {
	return (
		maybe instanceof Unary
		&& (
			undefined === type
			|| maybe.type === type
		)
		&& (
			undefined === predicate
			|| predicate(maybe.what)
		)
	);
}

export function is_substr(
	maybe: unknown,
): maybe is substr {
	return (
		maybe instanceof Call
		&& name_matches('substr', maybe.what)
		&& 3 === (maybe as Call).arguments.length
		&& (
			(maybe as Call).arguments[0] instanceof String
			|| is_str_repeat((maybe as Call).arguments[0])
		)
		&& (maybe as Call).arguments[1] instanceof Number
		&& (
			(maybe as Call).arguments[2] instanceof Number
			|| is_unary<
				'-',
				Number
			>(
				(maybe as Call).arguments[2],
				'-',
				(what) => what instanceof Number,
			)
		)
	);
}

export function make_substr_call(
	call: substr,
): string {
	let value: string;

	if (call.arguments[0] instanceof String) {
		value = call.arguments[0].value;
	} else {
		value = make_str_repeat_call(call.arguments[0]);
	}

	value = value.substring(
		call.arguments[1].value,
		value.length + (
			call.arguments[2] instanceof Number
				? call.arguments[2].value
				: (0 - call.arguments[2].what.value)
		),
	);

	return value;
}

export function is_str_repeat(
	maybe: unknown,
): maybe is str_repeat {
	return (
		maybe instanceof Call
		&& name_matches('str_repeat', maybe.what)
		&& 2 === (maybe as Call).arguments.length
		&& (maybe as Call).arguments[0] instanceof String
		&& (maybe as Call).arguments[1] instanceof Number
	);
}

export function make_str_repeat_call(call: str_repeat): string {
	return call.arguments[0].value.repeat(
		call.arguments[1].value,
	);
}
