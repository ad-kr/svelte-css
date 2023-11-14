import type { PreprocessorGroup } from "svelte/compiler";
import { processMarkup } from "./processors/processMarkup";
import { processScript } from "./processors/processScript";

export function cssProcessor(): PreprocessorGroup {
	return {
		name: "sveltesheet",
		markup: processMarkup,
		script: processScript,
	};
}

export function css(_: TemplateStringsArray, ...__: unknown[]) {}
export const cssTarget = { "data-sveltesheet-target": "" } as const;
