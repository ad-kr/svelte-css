export function convertCodeToLiteralExpression(code: string) {
	const codePattern = /:code\((.*?)\)/g;
	const processed = code.replace(codePattern, (_, inner) => `\${${inner}}`);
	return processed;
}
