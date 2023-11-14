import type { PreprocessorGroup } from "svelte/compiler";
import { processMarkup } from "./processors/processMarkup";
import { processScript } from "./processors/processScript";

export function cssProcessor(): PreprocessorGroup {
	return {
		name: "svelte-css",
		markup: processMarkup,
		script: processScript,
	};
}

export function css(_: TemplateStringsArray, ...__: unknown[]) {}
export const cssTarget = { "data-svelte-css-target": "" } as const;
