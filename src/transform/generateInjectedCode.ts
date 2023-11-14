/** Injects attributes to html tags and properties to components */
export function generateInjectedCode(
	componentId: string,
	componentInstanceIds: Map<string, string>,
	code: string
) {
	const lowercaseTagPattern = /<[a-z][^\/>\s]*(?=\s|>)/g;
	const uppercaseTagPattern = /<[A-Z][^\/>\s]*(?=\s|>)/g;
	const tagWithCssTargetPattern =
		/<[^>]*{\s*\.\.\.[^}]*cssTarget[^}]*}[^>]*>/g; // Matches whole tag that contains '{ ...cssTarget }';

	code = code.replace(lowercaseTagPattern, (tag) => {
		if (tag === "<script" || tag === "<style") return tag;
		return `${tag} data-svelte-css-ids={\`${componentId} \${svelteCssRuntimeId}\`}`;
	});

	code = code.replace(uppercaseTagPattern, (component) => {
		const componentTagName = component.substring(1);
		const instanceId = componentInstanceIds.get(componentTagName) ?? "";
		return `${component} dataSvelteCssIds={\`${instanceId} ${componentId} \${svelteCssRuntimeId}\`}`;
	});

	// TODO: Remove css-target string
	code = code.replace(tagWithCssTargetPattern, (tag) => {
		return tag.replace(
			"data-svelte-css-ids={`",
			"data-svelte-css-ids={`${dataSvelteCssIds} "
		);
	});

	return code;
}
