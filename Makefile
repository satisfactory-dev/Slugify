install:
	@npm install

generate:
	@echo 'generating rulesets'
	@node ./generate-rulesets.ts
	@echo 'generating data providers'
	@node ./generate-data-providers.ts
	@echo 'applying eslint to generated files'
	@./node_modules/.bin/eslint --fix ./generated-src/*.ts ./tests/generated/*.ts

build: generate
	@echo 'building from ./tsconfig.app.json'
	@./node_modules/.bin/tsc --project ./tsconfig.app.json

lint--tsc:
	@echo 'running syntax check'
	@./node_modules/.bin/tsc --project ./tsconfig.app-check.json

lint--prettier:
	@echo 'running prettier'
	@./node_modules/.bin/prettier . --check

lint--eslint:
	@./node_modules/.bin/tsc --project ./tsconfig.eslint.json
	@echo 'checking eslint for all issues with config'
	@./node_modules/.bin/eslint --config eslint.config.js.mjs --cache './**/*.mjs'
	@echo 'checking eslint for all issues'
	@./node_modules/.bin/eslint --cache './**/*.ts'

lint: lint--prettier lint--tsc lint--eslint

.PHONY: tests
tests: build
	@node ./tests.ts

.PHONY: coverage
coverage: build
	@./node_modules/.bin/c8 node ./tests.ts

npm-prep: tests
	@echo 'building from ./tsconfig.app-npm.json'
	@./node_modules/.bin/tsc --project ./tsconfig.app-npm.json
	@npm publish --dry-run
