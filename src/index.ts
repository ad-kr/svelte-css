import type { PreprocessorGroup } from "svelte/compiler";
import { preprocessMarkup, preprocessScript } from "./preprocessor";

export function sveltesheet(): PreprocessorGroup {
	return {
		name: "sveltesheet",
		markup: preprocessMarkup,
		script: preprocessScript,
	};
}

export function css(strings: TemplateStringsArray, ...values: unknown[]) {
	return strings.reduce((acc, curr, i) => acc + curr + (values[i] ?? ""), "");
}
export const cssTarget = {} as const;
