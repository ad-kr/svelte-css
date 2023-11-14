import { Preprocessor } from "svelte/compiler";

export const processScript: Preprocessor = (opts) => {
	const svelteCssId = 'export let dataSvelteCssIds = "";dataSvelteCssIds;';
	const runtimeIdCode =
		'const svelteCssRuntimeId = "rt" + crypto.randomUUID().replaceAll("-", "");';
        // 'const svelteCssRuntimeId = "rt" + Math.round(Math.random() * 100000000000);';

	const code = opts.content + svelteCssId + runtimeIdCode;

	return { code };
};
