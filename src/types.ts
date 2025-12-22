/**
 * This file contains manually-written type
 * definitions for third-party dependencies
 */

// better type definitions for locutus

declare module 'locutus/php/strings/strtr.js' {
	function strtr(
		value: string,
		trFrom: {[key: string]: string},
	): string;
	function strtr(
		value: string,
		trFrom: string,
		trTo: string,
	): string;

	export = strtr;
}

// better type definitions for php-parser
// incomplete, just implementing what's needed internally
// original license BSD-3 Clause
// original copyright 2018 Glayzzle
// @see https://github.com/glayzzle/php-parser/graphs/contributors

declare module 'php-parser/src/ast/array.js' {
	import type Entry from 'php-parser/src/ast/entry.js';
	import Expression from 'php-parser/src/ast/expression.js';
	import type Variable from 'php-parser/src/ast/variable.js';

	class Array<
		Items extends unknown[] = (
			| Entry
			| Expression<string>
			| Variable
		)[],
	> extends Expression<'array'> {
		readonly items: Items;

		readonly shortForm: boolean;
	}

	export = Array;
}

declare module 'php-parser/src/ast/attrgroup.js' {
	import type Attribute from 'php-parser/src/ast/attribute.js';
	import Node from 'php-parser/src/ast/node.js';

	class AttrGroup extends Node<'attrgroup'> {
		readonly attrs: Attribute[];
	}

	export = AttrGroup;
}

declare module 'php-parser/src/ast/attribute.js' {
	import Node from 'php-parser/src/ast/node.js';
	import type Parameter from 'php-parser/src/ast/parameter.js';

	class Attribute extends Node<'attribute'> {
		readonly args: Parameter[];

		readonly name: string;
	}

	export = Attribute;
}

declare module 'php-parser/src/ast/block.js' {
	import type Node from 'php-parser/src/ast/node.js';
	import Statement from 'php-parser/src/ast/statement.js';

	class Block<
		Kind extends string = 'block',
		Children extends Node<string>[] = Node<string>[],
	> extends Statement<Kind> {
		readonly children: Children;
	}

	export = Block;
}

declare module 'php-parser/src/ast/call.js' {
	import Expression from 'php-parser/src/ast/expression.js';
	import type Identifier from 'php-parser/src/ast/identifier.js';
	import type Name from 'php-parser/src/ast/name.js';
	import type Variable from 'php-parser/src/ast/variable.js';

	class Call<
		What extends Identifier|Variable|Name = Identifier|Variable,
		Arguments extends Expression<string>[] = Expression<string>[],
	> extends Expression<'call'> {
		readonly arguments: Arguments;

		readonly what: What;
	}

	export = Call;
}

declare module 'php-parser/src/ast/class.js' {
	import type AttrGroup from 'php-parser/src/ast/attrgroup.js';
	import Declaration from 'php-parser/src/ast/declaration.js';
	import type Identifier from 'php-parser/src/ast/identifier.js';

	class Class<
		Name extends string = string,
	> extends Declaration<'class', Name> {
		readonly attrGroups: AttrGroup[];

		readonly body: Declaration<string>[];

		readonly extends: Identifier|null;

		readonly implements: null|(Identifier[]);

		readonly isAbstract: boolean;

		readonly isAnonymous: boolean;

		readonly isFinal: boolean;

		readonly isReadonly: boolean;
	}

	export = Class;
}

declare module 'php-parser/src/ast/comment.js' {
	import Node from 'php-parser/src/ast/node.js';

	class Comment<Kind extends string = 'comment'> extends Node<
		Kind
	> {}

	export = Comment;
}

declare module 'php-parser/src/ast/commentblock.js' {
	import Comment from 'php-parser/src/ast/comment.js';

	class CommentBlock extends Comment<'commentblock'> {
	}

	export = CommentBlock;
}

declare module 'php-parser/src/ast/declaration.js' {
	import type Identifier from 'php-parser/src/ast/identifier.js';
	import Statement from 'php-parser/src/ast/statement.js';

	class Declaration<
		Kind extends string = 'declaration',
		Name extends string = string,
	> extends Statement<Kind> {
		readonly name: Identifier<Name>|Name;
	}

	export = Declaration;
}

declare module 'php-parser/src/ast/encapsedpart.js' {
	import Expression from 'php-parser/src/ast/expression.js';

	class EncapsedPart extends Expression<'encapsedpart'> {
		readonly curly: boolean;

		readonly expression: Expression<string>;

		readonly syntax: string;
	}

	export = EncapsedPart;
}

declare module 'php-parser/src/ast/entry.js' {
	import Expression from 'php-parser/src/ast/expression.js';
	import type Node from 'php-parser/src/ast/node.js';

	class Entry<
		Key extends Node|null = Node|null,
		Value extends Node = Node,
	> extends Expression<'entry'> {
		readonly byRef: boolean;

		readonly key: Key;

		readonly unpack: boolean;

		readonly value: Value;
	}

	export = Entry;
}

declare module 'php-parser/src/ast/expression.js' {
	import Node from 'php-parser/src/ast/node.js';

	class Expression<
		Kind extends string = 'expression',
	> extends Node<Kind> {
	}

	export = Expression;
}

declare module 'php-parser/src/ast/function.js' {
	import type AttrGroup from 'php-parser/src/ast/attrgroup.js';
	import Declaration from 'php-parser/src/ast/declaration.js';
	import type Block from 'php-parser/src/ast/block.js';
	import type Identifier from 'php-parser/src/ast/identifier.js';
	import type Parameter from 'php-parser/src/ast/parameter.js';

	class Function<
		Kind extends string = 'function',
		Name extends string = string,
	> extends Declaration<Kind, Name> {
		readonly arguments: Parameter[];

		readonly attrGroups: AttrGroup[];

		readonly body: Block|null;

		readonly byref: boolean;

		readonly nullable: boolean;

		readonly type: Identifier;
	}

	export = Function;
}

declare module 'php-parser/src/ast/identifier.js' {
	import Node from 'php-parser/src/ast/node.js';

	class Identifier<
		Name extends string = string,
	> extends Node<'identifier'> {
		readonly name: Name;
	}

	export = Identifier;
}

declare module 'php-parser/src/ast/literal.js' {
	import type EncapsedPart from 'php-parser/src/ast/encapsedpart.js';
	import Expression from 'php-parser/src/ast/expression.js';

	class Literal<
		Kind extends string = 'literal',
		Value extends (
			| EncapsedPart[]
			| Node
			| string
			| number
			| boolean
			| null
		) = (
			| EncapsedPart[]
			| Node
			| string
			| number
			| boolean
			| null
		),
	> extends Expression<Kind> {
		readonly raw: string;

		readonly value: Value;
	}

	export = Literal;
}

declare module 'php-parser/src/ast/method.js' {
	import Function from 'php-parser/src/ast/function.js';

	class Method<
		Name extends string = string,
	> extends Function<'method', Name> {
		readonly isAbstract: boolean;

		readonly isFinal: boolean;

		readonly isStatic: boolean;

		readonly visibility: string;
	}

	export = Method;
}
declare module 'php-parser/src/ast/name.js' {
	import Reference from 'php-parser/src/ast/reference.js';

	class Name<
		Name extends string = string,
	> extends Reference<'name'> {
		readonly name: Name;

		readonly resolution: string;
	}

	export = Name;
}

declare module 'php-parser/src/ast/namespace.js' {
	import type Block from 'php-parser/src/ast/block.js';

	class Namespace<
		Name extends string = string,
	> extends Block<'namespace'> {
		readonly name: Name;

		readonly withBrackets: boolean;
	}

	export = Namespace;
}

declare module 'php-parser/src/ast/node.js' {
	import type CommentBlock from 'php-parser/src/ast/commentblock.js';

	class Node<
		Kind extends string = string,
	> {
		readonly kind: Kind;

		readonly leadingComments: (
			| CommentBlock[]
			| Comment[]
			| null
		);

		readonly location: Location|null;

		readonly trailingComments: (
			| CommentBlock[]
			| Comment[]
			| null
		);
	}

	export = Node;
}

declare module 'php-parser/src/ast/number.js' {
	import Literal from 'php-parser/src/ast/literal.js';

	class Number<
		Value extends number = number,
	> extends Literal<'number', Value> {
	}

	export = Number;
}

declare module 'php-parser/src/ast/operation.js' {
	import Expression from 'php-parser/src/ast/expression.js';

	class Operation<
		Kind extends string = 'operation',
	> extends Expression<Kind> {
	}

	export = Operation;
}

declare module 'php-parser/src/ast/parameter.js' {
	import type AttrGroup from 'php-parser/src/ast/attrgroup.js';
	import Declaration from 'php-parser/src/ast/declaration.js';
	import type Identifier from 'php-parser/src/ast/identifier.js';
	import type Node from 'php-parser/src/ast/node.js';

	type MODIFIER_PUBLIC = 1;
	type MODIFIER_PROTECTED = 2;
	type MODIFIER_PRIVATE = 4;

	class Parameter extends Declaration<'parameter'> {
		readonly attrGroups: AttrGroup[];

		readonly byref: boolean;

		readonly flags: (
			| 0
			| MODIFIER_PUBLIC
			| MODIFIER_PROTECTED
			| MODIFIER_PRIVATE
		);

		readonly nullable: boolean;

		readonly readonly: boolean;

		readonly type: Identifier|null;

		readonly value: Node|null;
	}

	export = Parameter;
}

declare module 'php-parser/src/ast/property.js' {
	import type AttrGroup from 'php-parser/src/ast/attrgroup.js';
	import type Identifier from 'php-parser/src/ast/identifier.js';
	import type Node from 'php-parser/src/ast/node.js';
	import Statement from 'php-parser/src/ast/statement.js';

	class Property<
		Name extends string = string,
		Value extends Node<string>|null = Node<string>|null,
	> extends Statement<'property'> {
		readonly attrGroups: AttrGroup[];

		readonly name: Identifier<Name>|Name;

		readonly nullable: boolean;

		readonly readonly: boolean;

		readonly type: Identifier|([Identifier, ...Identifier[]]);

		readonly value: Value;
	}

	export = Property;
}

declare module 'php-parser/src/ast/propertystatement.js' {
	import type Property from 'php-parser/src/ast/property.js';
	import Statement from 'php-parser/src/ast/statement.js';

	class PropertyStatement extends Statement<'propertystatement'> {
		readonly isStatic: boolean;

		readonly properties: Property[];

		readonly visibility: string|null;
	}

	export = PropertyStatement;
}

declare module 'php-parser/src/ast/reference.js' {
	import Node from 'php-parser/src/ast/node.js';

	class Reference<
		Kind extends string = 'reference',
	> extends Node<Kind> {
	}

	export = Reference;
}

declare module 'php-parser/src/ast/return.js' {
	import type Expression from 'php-parser/src/ast/expression.js';
	import Statement from 'php-parser/src/ast/statement.js';

	class Return extends Statement<'return'> {
		readonly expr: Expression<string>;
	}

	export = Return;
}

declare module 'php-parser/src/ast/statement.js' {
	import type Node from 'php-parser/src/ast/node.js';

	class Statement<
		Kind extends string = 'statement',
	> extends Node<Kind> {
	}

	export = Statement;
}

declare module 'php-parser/src/ast/string.js' {
	import Literal from 'php-parser/src/ast/literal.js';

	class String<
		Value extends string = string,
	> extends Literal<'string', Value> {
		readonly isDoubleQuote: boolean;

		readonly unicode: boolean;
	}

	export = String;
}

declare module 'php-parser/src/ast/unary.js' {
	import type Expression from 'php-parser/src/ast/expression.js';
	import Operation from 'php-parser/src/ast/operation.js';

	class Unary<
		Type extends string = string,
		What extends Expression<string> = Expression<string>,
	> extends Operation<'unary'> {
		readonly type: Type;

		readonly what: What;
	}

	export = Unary;
}

declare module 'php-parser/src/ast/variable.js' {
	import Expression from 'php-parser/src/ast/expression.js';
	import type Node from 'php-parser/src/ast/node.js';

	class Variable extends Expression<'variable'> {
		readonly curly: boolean;

		readonly name: string|Node;
	}

	export = Variable;
}
