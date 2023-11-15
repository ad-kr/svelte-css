import type { PreprocessorGroup } from "svelte/compiler";
import { processMarkup } from "./processors/processMarkup";
import { processScript } from "./processors/processScript";

export type CssProcessorOtions = {
	printCode?: boolean;
};

export function sveltesheet(
	processorOptions: CssProcessorOtions = { printCode: false }
): PreprocessorGroup {
	return {
		name: "sveltesheet",
		markup: (opts) => processMarkup(opts, processorOptions),
		script: processScript,
	};
}

export function css(_: TemplateStringsArray, ...__: unknown[]) {}
export const cssTarget = { "data-sveltesheet-target": "" } as const;
