import type { PreprocessorGroup } from "svelte/compiler";
import { preprocessMarkup, preprocessScript } from "./preprocessor";

export function sveltesheet(): PreprocessorGroup {
	return {
		name: "sveltesheet",
		markup: preprocessMarkup,
		script: preprocessScript,
	};
}

export function css(_: TemplateStringsArray, ...__: unknown[]) {}
export const cssTarget = {} as const;
