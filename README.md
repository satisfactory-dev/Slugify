[![Coverage Status](https://coveralls.io/repos/github/satisfactory-dev/Slugify/badge.svg?branch=main)](https://coveralls.io/github/satisfactory-dev/Slugify?branch=main)
[![Workflow Status](https://github.com/satisfactory-dev/Slugify/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/satisfactory-dev/Slugify/actions/workflows/node.js.yml?query=branch%3Amain)

# Slugify

A partially-manual, partially-code-generated port of [cocur/slugify](https://github.com/cocur/slugify)

## Why?

In the process of rewriting the site builder for the
[Satisfactory Clips Archive](https://archive.satisfactory.video/)
it became desirable to have a slugifier that was compatible with the one
used by the current site builder- `cocur/slugify`.

## Partially-code-generated?

Using a combination of TypeScript's factory methods and
[php-parser](https://github.com/glayzzle/php-parser) some essential types
are transposed to TypeScript at build time to ensure a reasonable degree
of compatibility with `cocur/slugify`.

### Do you mean vibe-coded?

AHAHAHAHAHAHAHAHAHAHAHAHAHA

No.

## Partially-manual?

While one could _hypothetically_ perform code generation to port the PHP
source to TypeScript, it's more straightforward to hand-write the
core implementation.

[`strtr()`](https://locutus.io/php/strings/strtr/) is pulled in as a
dependency from [locutus](https://github.com/locutusjs/locutus/), as while
a dependency-free implementation was attempted, it had compatibility
issues with `cocur/slugify`.

## Compatibility with cocur/slugify

- Only the rules/rulesets methods/options are implemented.
- The default rulesets are generated at build time using TypeScript's factory methods.
- Tests for testing `\\Cocur\\Slugify::slugify()` will be partially generated at build time.
- `Slugify::slugify()` is async, to provide for the possibilty of async-sourced rulesets.
