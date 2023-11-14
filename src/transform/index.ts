import { AstItem, Selector, SelectorPart } from "../ast";

export function generateStyles(
	componentId: string,
	componentInstanceIds: Map<string, string>,
	items: AstItem[]
) {
	const staticRules: AstItem[] = [];
	const dynamicRules: AstItem[] = [];

	for (const item of items) {
		const staticProperties = item.body.filter(
			(prop) => prop.type === "static"
		);
		const dynamicProperties = item.body.filter(
			(prop) => prop.type === "dynamic"
		);

		if (staticProperties.length > 0)
			staticRules.push({ ...item, body: staticProperties });
		if (dynamicProperties.length > 0)
			dynamicRules.push({ ...item, body: dynamicProperties });
	}

	const staticStyle = generateStaticStyle(
		componentId,
		componentInstanceIds,
		staticRules
	);

	const dynamicStyle = generateDynamicStyle(
		componentInstanceIds,
		dynamicRules
	);

	return { staticStyle, dynamicStyle };
}

function generateStaticStyle(
	componentId: string,
	componentInstanceIds: Map<string, string>,
	staticRules: AstItem[]
) {
	let innerStyle = "";

	for (const rule of staticRules) {
		const selector = generateStaticSelector(
			componentId,
			componentInstanceIds,
			rule.selectors
		);

		const body = rule.body.map((body) => body.property).join("");

		innerStyle += `${selector}{${body}}`;
	}

	return `<style>${innerStyle}</style>`;
}

function generateDynamicStyle(
	componentInstanceIds: Map<string, string>,
	dynamicRules: AstItem[]
) {
	let innerStyle = "";

	for (const rule of dynamicRules) {
		const selector = generateDynamicSelector(
			componentInstanceIds,
			rule.selectors
		);

		const body = rule.body.map((body) => body.property).join("");

		innerStyle += `${selector}{${body}}`;
	}

	return `<svelte:element this="style">{\`${innerStyle}\`}</svelte:element>`;
}

function generateDynamicSelector(
	componentInstanceIds: Map<string, string>,
	selectors: Selector[]
) {
	return selectors
		.map((selector) =>
			selector.reduce(
				(prev, curr) =>
					prev +
					generateDynamicSelectorString(curr, componentInstanceIds),
				""
			)
		)
		.join(",");
}

function generateStaticSelector(
	componentId: string,
	componentInstanceIds: Map<string, string>,
	selectors: Selector[]
) {
	return selectors
		.map((selector) =>
			selector.reduce(
				(prev, curr) =>
					prev +
					generateStaticSelectorString(
						curr,
						componentId,
						componentInstanceIds
					),
				""
			)
		)
		.join(",");
}

function generateStaticSelectorString(
	selectorPart: SelectorPart,
	componentId: string,
	componentInstanceIds: Map<string, string>
) {
	if (selectorPart.type === "combinator") return selectorPart.combinator;

	if (selectorPart.reference.type === "part")
		return `:global(${selectorPart.reference.part}[data-svelte-css-ids*="${componentId}"])`;

	const uniqueComponentId =
		componentInstanceIds.get(selectorPart.reference.component) ?? "";

	return `:global([data-svelte-css-ids*="${uniqueComponentId}"]${selectorPart.reference.additionalSelector}[data-svelte-css-ids*="${componentId}"])`;
}

function generateDynamicSelectorString(
	selectorPart: SelectorPart,
	componentInstanceIds: Map<string, string>
) {
	if (selectorPart.type === "combinator") return selectorPart.combinator;

	if (selectorPart.reference.type === "part")
		return `${selectorPart.reference.part}[data-svelte-css-ids*="\${svelteCssRuntimeId}"]`;

	const uniqueComponentId =
		componentInstanceIds.get(selectorPart.reference.component) ?? "";

	return `[data-svelte-css-ids*="${uniqueComponentId}"]${selectorPart.reference.additionalSelector}[data-svelte-css-ids*="\${svelteCssRuntimeId}"]`;
}
