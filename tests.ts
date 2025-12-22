import {
	spec,
} from 'node:test/reporters';
import {
	run,
} from 'node:test';

import {
	glob,
} from 'fs/promises';

const ac = new AbortController();

let already_stopped = false;

const files: string[] = [];

const glob_path = `${import.meta.dirname}/tests/**/*.spec.ts`;

for await(const filepath of glob(glob_path)) {
	files.push(filepath);
}

run({
	files,
	concurrency: true,
	signal: ac.signal,
})
	.on('test:fail', (e) => {
		ac.abort();
		if (!already_stopped) {
			console.error(e);
		}
		already_stopped = true;
		process.exitCode = 1;
	})
	.compose(spec)
	.pipe(process.stdout);
