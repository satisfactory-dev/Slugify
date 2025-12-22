import {
	readFile,
} from 'node:fs/promises';

import {
	createWriteStream,
} from 'node:fs';

import {
	Engine,
} from 'php-parser';

import {
	createPrinter,
	createSourceFile,
	EmitHint,
	factory,
	NewLineKind,
	NodeFlags,
	ScriptKind,
	ScriptTarget,
	SyntaxKind,
} from 'typescript';

import Array from 'php-parser/src/ast/array.js';
import Call from 'php-parser/src/ast/call.js';
import type Declaration from 'php-parser/src/ast/declaration.js';
import Entry from 'php-parser/src/ast/entry.js';
import Method from 'php-parser/src/ast/method.js';
import Return from 'php-parser/src/ast/return.js';
import String from 'php-parser/src/ast/string.js';

import type {
	str_repeat,
	substr,
} from './utilities/php-parser.ts';
import {
	find_in_class_body,
	is_array,
	is_str_repeat,
	is_substr,
	make_str_repeat_call,
	make_substr_call,
	name_matches,
} from './utilities/php-parser.ts';

const parser = new Engine({});

const SlugifyTest_php_filepath = `${
	import.meta.dirname
}/slugify/tests/SlugifyTest.php`;

const ast = parser.parseCode(
	(await readFile(SlugifyTest_php_filepath)).toString(),
	SlugifyTest_php_filepath,
);

const defaultRuleProvider = find_in_class_body(
	ast,
	'Cocur\\Slugify\\Tests',
	'SlugifyTest',
	(
		maybe: Declaration<string, string>,
	): maybe is Method<'defaultRuleProvider'> => (
		maybe instanceof Method
		&& name_matches('defaultRuleProvider', maybe.name)
	),
);

const defaultRuleProviderReturn = defaultRuleProvider.body?.children.find(
	(maybe): maybe is Return => maybe instanceof Return,
);

if (!defaultRuleProviderReturn) {
	throw new Error('Could not find return statement!');
} else if (!(defaultRuleProviderReturn.expr instanceof Array)) {
	throw new Error('Return statement was not an array!');
} else if ((defaultRuleProviderReturn.expr as Array).items.find((maybe) => !(
	maybe instanceof Entry
	&& is_array<[
		Entry<null, (
			| String
			| str_repeat
			| substr
		)>,
		Entry<null, (
			| String
			| str_repeat
			| substr
		)>,
	]>(
		maybe.value,
		2,
		(item) => (
			item instanceof Entry
			&& null === item.key
			&& (
				item.value instanceof String
				|| (
					item.value instanceof Call
					&& (
						is_str_repeat(item.value)
						|| is_substr(item.value)
					)
				)
			)
		),
	)
))) {
	throw new Error('Unexpected value found on return expression!');
}

const coerced = (
	defaultRuleProviderReturn.expr.items as Entry<
		null,
		Array<[
			Entry<null, (
				| String
				| str_repeat
				| substr
			)>,
			Entry<null, (
				| String
				| str_repeat
				| substr
			)>,
		]>
	>[]
);

const mapped = coerced.map((node) => node.value.items.map((item): string => {
	if (item.value instanceof String) {
		return item.value.value;
	} else if (is_str_repeat(item.value)) {
		return make_str_repeat_call(item.value);
	}

	return make_substr_call(item.value);
}) as [string, string]);

const defaultRuleProvider_export = factory.createVariableStatement(
	[
		factory.createToken(SyntaxKind.ExportKeyword),
	],
	factory.createVariableDeclarationList(
		[
			factory.createVariableDeclaration(
				'defaultRuleProvider',
				undefined,
				undefined,
				factory.createArrayLiteralExpression(
					mapped.map((row) => factory.createArrayLiteralExpression(
						row.map((value) => factory.createStringLiteral(value)),
						true,
					)),
					true,
				),
			),
		],
		NodeFlags.Const,
	),
);


const printer = createPrinter({
	newLine: NewLineKind.LineFeed,
	noEmitHelpers: true,
});

const filepath = `${
	import.meta.dirname
}/tests/generated/defaultRuleProvider.ts`;

const source_file = createSourceFile(
	SlugifyTest_php_filepath,
	'',
	ScriptTarget.Latest,
	false,
	ScriptKind.TS,
);

const stream = createWriteStream(filepath);

stream.write('/* eslint-disable @stylistic/max-len */');
stream.write('\n\n');
stream.write(printer.printNode(
	EmitHint.Unspecified,
	defaultRuleProvider_export,
	source_file,
));

await new Promise<void>((yup) => {
	stream.end(() => {
		yup();
	});
});
