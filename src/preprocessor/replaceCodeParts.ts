export function replaceCodeParts(css: string) {
	const codeBlockPattern = /\${(.*)}/g;
	const processedCss = css.replace(
		codeBlockPattern,
		(_, inner) => `:code(${inner})`
	);
	return processedCss;
}
