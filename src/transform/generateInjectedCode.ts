/** Injects attributes to html tags and properties to components */
export function generateInjectedCode(
	componentId: string,
	componentInstanceIds: Map<string, string>,
	code: string
) {
	const lowercaseTagPattern = /<[a-z][^\/>\s]*(?=\s|>)/g;
	const uppercaseTagPattern = /<[A-Z][^\/>\s]*(?=\s|>)/g;
	const tagWithCssTargetPattern =
		/<[a-z][^>]*{\s*\.\.\.[^}]*cssTarget[^}]*}[^>]*>/g; // Matches whole tag that contains '{ ...cssTarget }';
	const componentWithCssTargetPattern =
		/<[A-Z][^>]*{\s*\.\.\.[^}]*cssTarget[^}]*}[^>]*>/g; // Matches whole tag that contains '{ ...cssTarget }';
	const cssTargetPattern = /{\s*\.\.\.[^}]*cssTarget[^}]*}/g;

	code = code.replace(lowercaseTagPattern, (tag) => {
		if (tag === "<script" || tag === "<style") return tag;
		return `${tag} data-sveltesheet-ids={\`${componentId} \${svelteCssRuntimeId}\`}`;
	});

	code = code.replace(uppercaseTagPattern, (component) => {
		const componentTagName = component.substring(1);
		const instanceId = componentInstanceIds.get(componentTagName) ?? "";
		return `${component} dataSvelteCssIds={\`${instanceId} ${componentId} \${svelteCssRuntimeId}\`}`;
	});

	// TODO: Remove css-target attributes
	code = code.replace(tagWithCssTargetPattern, (tag) => {
		return tag
			.replace(
				"data-sveltesheet-ids={`",
				"data-sveltesheet-ids={`${dataSvelteCssIds} "
			)
			.replace(cssTargetPattern, "");
	});

	code = code.replace(componentWithCssTargetPattern, (component) => {
		return component
			.replace(
				"dataSvelteCssIds={`",
				"dataSvelteCssIds={`${dataSvelteCssIds} "
			)
			.replace(cssTargetPattern, "");
	});

	return code;
}
