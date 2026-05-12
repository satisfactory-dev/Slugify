import {
	glob,
	readFile,
} from 'node:fs/promises';
import {
	createWriteStream,
} from 'node:fs';

import {
	basename,
} from 'node:path';

import type {
	ComputedPropertyName,
} from 'typescript';
import {
	createPrinter,
	createSourceFile,
	EmitHint,
	factory,
	NewLineKind,
	ScriptKind,
	ScriptTarget,
	SyntaxKind,
} from 'typescript';

import type {
	Rules,
} from './src/RuleProvider/RuleProviderInterface.ts';

import {
	Engine,
} from 'php-parser';

import Array from 'php-parser/src/ast/array.js';
import type Declaration from 'php-parser/src/ast/declaration.js';
import Entry from 'php-parser/src/ast/entry.js';
import Property from 'php-parser/src/ast/property.js';
import String from 'php-parser/src/ast/string.js';

import {
	find_property_in_class,
	name_matches,
} from './utilities/php-parser.ts';


const parser = new Engine({});

const Slugify_php_filepath = `${
	import.meta.dirname
}/slugify/src/Slugify.php`;

const ast = parser.parseCode(
	(await readFile(Slugify_php_filepath)).toString(),
	Slugify_php_filepath,
);

const slugify_options = find_property_in_class(
	ast,
	'Cocur\\Slugify',
	'Slugify',
	(
		maybe: Declaration<string, string>,
	): maybe is Property<'options', Array> => (
		maybe instanceof Property
		&& name_matches('options', maybe.name)
		&& maybe.value instanceof Array
	),
);

const maybe_slugify_options_rulesets = slugify_options.value.items.find(
	(maybe): maybe is Entry<
		String<'rulresets'>,
		Array<[Entry<null, String>, ...Entry<null, String>[]]>
	> => {
		return (
			maybe instanceof Entry
			&& maybe.key instanceof String
			&& 'rulesets' === maybe.key.value
			&& maybe.value instanceof Array
			&& (maybe.value as Array).items.length > 0
			&& (maybe.value as Array).items.every(
				(item) => (
					item instanceof Entry
					&& item.value instanceof String
				),
			)
		);
	},
);

if (!maybe_slugify_options_rulesets) {
	throw new Error(
		'Could not find \\Cocur\\Slugify\\Slugify::$options[\'rulesets\']',
	);
}

const slugify_options_rulesets = maybe_slugify_options_rulesets.value.items
	.map((item) => item.value.value);

const rulesets: {[key: string]: Rules} = {};

for await (const filepath of glob(
	`${import.meta.dirname}/slugify/Resources/rules/*.json`,
)) {
	const {default: ruleset} = (await import(filepath, {
		with: {
			type: 'json',
		},
	}) as {default: unknown});

	const ruleset_name = basename(filepath, '.json');

	if (
		'object' !== typeof ruleset
	) {
		throw new Error(`${ruleset_name} did not resolve to an object!`);
	} else if (
		null === ruleset
	) {
		throw new Error(`${ruleset_name} resolved to null!`);
	} else if (Object.entries(ruleset).find((maybe) => (
		!(
			'string' === typeof maybe[0]
			&& 'string' === typeof maybe[1]
		)
	))) {
		throw new Error(
			`${ruleset_name} contained some non-string key/value pairs!`,
		);
	}

	rulesets[ruleset_name] = ruleset as Rules;
}

function maybe_computed(value: string): string|ComputedPropertyName {
	return !/^[A-Za-z_][A-Za-z_]*$/.test(value)
		? factory.createComputedPropertyName(
			factory.createStringLiteral(value),
		)
		: value;
}

const import_declaration = factory.createImportDeclaration(
	undefined,
	factory.createImportClause(
		SyntaxKind.TypeKeyword,
		undefined,
		factory.createNamedImports([
			factory.createImportSpecifier(
				false,
				undefined,
				factory.createIdentifier('RuleProviderInterface'),
			),
			factory.createImportSpecifier(
				false,
				undefined,
				factory.createIdentifier('Rulesets'),
			),
		]),
	),
	factory.createStringLiteral(
		'../src/RuleProvider/RuleProviderInterface.ts',
	),
);

const not_a_supported_ruleset = factory.createTemplateExpression(
	factory.createTemplateHead('"'),
	[factory.createTemplateSpan(
		factory.createIdentifier('ruleset'),
		factory.createTemplateTail(
			'" is not a supported ruleset for this provider!',
		),
	)],
);

const generated_class = factory.createClassDeclaration(
	[
		factory.createToken(SyntaxKind.ExportKeyword),
	],
	'DefaultRuleProvider',
	undefined,
	[
		factory.createHeritageClause(
			SyntaxKind.ImplementsKeyword,
			[
				factory.createExpressionWithTypeArguments(
					factory.createIdentifier('RuleProviderInterface'),
					undefined,
				),
			],
		),
	],
	[
		factory.createPropertyDeclaration(
			undefined,
			factory.createPrivateIdentifier('#rulesets'),
			undefined,
			factory.createTypeReferenceNode('Rulesets'),
			factory.createObjectLiteralExpression(
				Object.entries(
					rulesets,
				).map(([
					ruleset_name,
					ruleset,
				]) => factory.createPropertyAssignment(
					maybe_computed(ruleset_name),
					factory.createObjectLiteralExpression(
						Object.entries(
							ruleset,
						).map(([
							key,
							value,
						]) => factory.createPropertyAssignment(
							maybe_computed(key),
							factory.createStringLiteral(value),
						)),
						true,
					),
				)),
				true,
			),
		),
		factory.createMethodDeclaration(
			undefined,
			undefined,
			'getRules',
			undefined,
			[
				factory.createTypeParameterDeclaration(
					undefined,
					'T',
					factory.createParenthesizedType(
						factory.createUnionTypeNode(Object.keys(rulesets).map(
							(ruleset_name) => factory.createLiteralTypeNode(
								factory.createStringLiteral(
									ruleset_name,
								),
							),
						)),
					),
				),
			],
			[
				factory.createParameterDeclaration(
					undefined,
					undefined,
					'ruleset',
					undefined,
					factory.createTypeReferenceNode('T'),
				),
			],
			undefined,
			factory.createBlock([
				factory.createIfStatement(
					factory.createPrefixUnaryExpression(
						SyntaxKind.ExclamationToken,
						factory.createParenthesizedExpression(
							factory.createBinaryExpression(
								factory.createIdentifier('ruleset'),
								factory.createToken(SyntaxKind.InKeyword),
								factory.createPropertyAccessExpression(
									factory.createIdentifier('this'),
									factory.createIdentifier('#rulesets'),
								),
							),
						),
					),
					factory.createThrowStatement(
						factory.createNewExpression(
							factory.createIdentifier('Error'),
							undefined,
							[not_a_supported_ruleset],
						),
					),
				),
				factory.createReturnStatement(
					factory.createCallExpression(
						factory.createPropertyAccessExpression(
							factory.createIdentifier('Promise'),
							'resolve',
						),
						undefined,
						[factory.createElementAccessExpression(
							factory.createPropertyAccessExpression(
								factory.createIdentifier('this'),
								factory.createIdentifier('#rulesets'),
							),
							factory.createIdentifier('ruleset'),
						)],
					),
				),
			]),
		),
		factory.createMethodDeclaration(
			[
				factory.createToken(SyntaxKind.StaticKeyword),
			],
			undefined,
			'provided_rulesets',
			undefined,
			undefined,
			[],
			undefined,
			factory.createBlock([
				factory.createReturnStatement(
					factory.createArrayLiteralExpression(
						slugify_options_rulesets.map((
							ruleset_name,
						) => factory.createStringLiteral(ruleset_name)),
						true,
					),
				),
			]),
		),
	],
);

const printer = createPrinter({
	newLine: NewLineKind.LineFeed,
	noEmitHelpers: true,
});

const filepath = `${import.meta.dirname}/generated-src/DefaultRuleProvider.ts`;

const source_file = createSourceFile(
	filepath,
	'',
	ScriptTarget.Latest,
	false,
	ScriptKind.TS,
);

const stream = createWriteStream(filepath);

stream.write('/* oxlint-disable @stylistic/max-len */');
stream.write('\n\n');
stream.write(printer.printNode(
	EmitHint.Unspecified,
	import_declaration,
	source_file,
));
stream.write('\n\n');
stream.write(printer.printNode(
	EmitHint.Unspecified,
	generated_class,
	source_file,
).replace(/getRules<T extends \(([^)]+)\)/, (
	substring,
	union: string,
) => {
	return `getRules<T extends (\n\t\t| ${
		union.split(' | ').join(`\n\t\t| `)
	}\n\t)`;
}));

await new Promise<void>((yup) => {
	stream.end(() => {
		yup();
	});
});
