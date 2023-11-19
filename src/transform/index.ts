import { AstItem, Property, Reference, Selector, SelectorPart } from "../ast";
import { TokenWrapper } from "../tokenizer/utils";

// TODO: Create separate transpiler class that contains componentID and componentInstanceIds, so that they don't have to be passed as arguments to every function
export function transpileItems(
	items: AstItem[],
	componentId: string,
	componentInstanceIds: Map<string, string>
) {
	let staticInner = "";
	let dynamicInner = "";

	for (const item of items) {
		const { staticString, dynamicString } = transpileItem(
			item,
			componentId,
			componentInstanceIds
		);
		staticInner += staticString + "\n";
		dynamicInner += dynamicString + "\n";
	}

	const staticStyle =
		staticInner !== "" ? `<style>\n${staticInner}</style>` : "";
	const dynamicStyle =
		dynamicInner !== ""
			? `<svelte:element this="style">\n{\`${dynamicInner}\`}</svelte:element>`
			: "";

	return { staticStyle, dynamicStyle };
}

function transpileItem(
	item: AstItem,
	componentId: string,
	componentInstanceIds: Map<string, string>,
	options?: { shouldForceStatic?: boolean }
): {
	staticString: string;
	dynamicString: string;
} {
	switch (item.type) {
		case "rule":
			return transpileRule(
				item,
				componentId,
				componentInstanceIds,
				options
			);
		case "at-rule":
			return transpileAtRule(item, componentId, componentInstanceIds);
	}
}

function transpileRule(
	rule: Extract<AstItem, { type: "rule" }>,
	componentId: string,
	componentInstanceIds: Map<string, string>,
	options?: { shouldForceStatic?: boolean }
): {
	staticString: string;
	dynamicString: string;
} {
	let staticProperties = "";
	let dynamicProperties = "";

	for (const property of rule.body) {
		if (property.type === "static") {
			staticProperties += property.property;
			continue;
		}
		dynamicProperties += property.property;
	}

	const staticSelector = transpileSelectorList(
		rule.selectors,
		componentId,
		componentInstanceIds,
		{
			isStatic:
				options?.shouldForceStatic !== undefined
					? options.shouldForceStatic
					: true,
		}
	);

	const dynamicSelector = transpileSelectorList(
		rule.selectors,
		componentId,
		componentInstanceIds,
		{
			isStatic:
				options?.shouldForceStatic !== undefined
					? options.shouldForceStatic
					: false,
		}
	);

	const staticString =
		staticProperties !== "" ? `${staticSelector}{${staticProperties}}` : "";
	const dynamicString =
		dynamicProperties !== ""
			? `${dynamicSelector}{${dynamicProperties}}`
			: "";

	return { staticString, dynamicString };
}

function transpileSelectorList(
	selectorList: Selector[],
	componentId: string,
	componentInstanceIds: Map<string, string>,
	options: { isStatic: boolean }
) {
	return selectorList
		.map((selector) =>
			transpileSeletor(
				selector,
				componentId,
				componentInstanceIds,
				options
			)
		)
		.join(",");
}

function transpileSeletor(
	selector: Selector,
	componentId: string,
	componentInstanceIds: Map<string, string>,
	options: { isStatic: boolean }
) {
	return selector
		.map((selector) =>
			transpileSelectorPart(
				selector,
				componentId,
				componentInstanceIds,
				options
			)
		)
		.join("");
}

function transpileSelectorPart(
	selectorPart: SelectorPart,
	componentId: string,
	componentInstanceIds: Map<string, string>,
	options: { isStatic: boolean }
) {
	if (selectorPart.type === "combinator") return selectorPart.combinator;

	if (options.isStatic)
		return transpileStaticSelectorReference(
			selectorPart.reference,
			componentId,
			componentInstanceIds
		);
	return transpileDynamicSelectorReference(
		selectorPart.reference,
		componentInstanceIds
	);
}

function transpileStaticSelectorReference(
	reference: Reference,
	componentId: string,
	componentInstanceIds: Map<string, string>
) {
	if (reference.type === "part")
		return `:global(${reference.part}[data-sveltesheet-ids*="${componentId}"])`;

	const uniqueComponentId =
		componentInstanceIds.get(reference.component) ?? "";

	return `:global([data-sveltesheet-ids*="${uniqueComponentId}"]${reference.additionalSelector}[data-sveltesheet-ids*="${componentId}"])`;
}

function transpileDynamicSelectorReference(
	reference: Reference,
	componentInstanceIds: Map<string, string>
) {
	if (reference.type === "part")
		return `${reference.part}[data-sveltesheet-ids*="\${svelteCssRuntimeId}"]`;

	const uniqueComponentId =
		componentInstanceIds.get(reference.component) ?? "";

	return `[data-sveltesheet-ids*="${uniqueComponentId}"]${reference.additionalSelector}[data-sveltesheet-ids*="\${svelteCssRuntimeId}"]`;
}

// TODO: Rewrite
function transpileAtRule(
	atRule: Extract<AstItem, { type: "at-rule" }>,
	componentId: string,
	componentInstanceIds: Map<string, string>
) {
	const atRuleQuery = atRule.query.queryTokens
		.map((token) => new TokenWrapper(token).toCssString())
		.join("");
	let innerString = "";

	for (const item of atRule.items) {
		const { staticString, dynamicString } = transpileItem(
			item,
			componentId,
			componentInstanceIds,
			{ shouldForceStatic: false } // TODO: For now, we force dynamic transpilation of items inside at-rules. This is because we don't know if the at-rule is static or dynamic. We should fix this in the future.
		);
		innerString += staticString + dynamicString;
	}

	const atRuleString =
		innerString.length > 0 ? `${atRuleQuery}{${innerString}}` : "";

	return {
		staticString: "",
		dynamicString: atRuleString,
	};
}

export function generateStyles(
	componentId: string,
	componentInstanceIds: Map<string, string>,
	items: AstItem[]
) {
	const { staticAstItems, dynamicAstItems } =
		splitStaticAndDynamicASTItems(items);

	const staticStyle = generateStaticStyle(
		componentId,
		componentInstanceIds,
		staticAstItems
	);

	const dynamicStyle = generateDynamicStyle(
		componentInstanceIds,
		dynamicAstItems
	);

	return { staticStyle, dynamicStyle };
}

function splitStaticAndDynamicASTItems(items: AstItem[]) {
	const staticAstItems: AstItem[] = [];
	const dynamicAstItems: AstItem[] = [];

	for (const item of items) {
		if (item.type === "rule") {
			const { staticRules, dynamicRules } =
				splitStaticAndDynamicRule(item);

			if (staticRules) staticAstItems.push(staticRules);
			if (dynamicRules) dynamicAstItems.push(dynamicRules);
			continue;
		}

		const { staticRules, dynamicRules } = splitStaticAndDynamicAtRule(item);

		if (staticRules) staticAstItems.push(staticRules);
		if (dynamicRules) dynamicAstItems.push(dynamicRules);
	}

	return { staticAstItems, dynamicAstItems };
}

function splitStaticAndDynamicRule(item: Extract<AstItem, { type: "rule" }>) {
	const staticProperties: Property[] = [];
	const dynamicProperties: Property[] = [];

	for (const property of item.body) {
		if (property.type === "static") {
			staticProperties.push(property);
			continue;
		}
		dynamicProperties.push(property);
	}

	return {
		staticRules:
			staticProperties.length > 0
				? { ...item, body: staticProperties }
				: null,
		dynamicRules:
			staticProperties.length > 0
				? { ...item, body: dynamicProperties }
				: null,
	};
}

function splitStaticAndDynamicAtRule(
	item: Extract<AstItem, { type: "at-rule" }>
) {
	const staticRuleList: AstItem[] = [];
	const dynamicRuleList: AstItem[] = [];

	for (const rule of item.items) {
		if (rule.type === "rule") {
			const { staticRules, dynamicRules } =
				splitStaticAndDynamicRule(rule);
			if (staticRules) staticRuleList.push(staticRules);
			if (dynamicRules) dynamicRuleList.push(dynamicRules);
			continue;
		}
		const { staticRules, dynamicRules } = splitStaticAndDynamicAtRule(rule);
		if (staticRules) staticRuleList.push(staticRules);
		if (dynamicRules) dynamicRuleList.push(dynamicRules);
	}

	return {
		staticRules:
			staticRuleList.length > 0
				? { ...item, rules: staticRuleList }
				: null,
		dynamicRules:
			dynamicRuleList.length > 0
				? { ...item, rules: dynamicRuleList }
				: null,
	};
}

function generateStaticStyle(
	componentId: string,
	componentInstanceIds: Map<string, string>,
	staticItems: AstItem[]
) {
	let innerStyle = "";

	for (const item of staticItems) {
		if (item.type === "rule") {
			innerStyle += transpileStaticRule(
				componentId,
				componentInstanceIds,
				item
			);
			continue;
		}
		innerStyle += transpileStaticAtRule(
			componentId,
			componentInstanceIds,
			item
		);
	}

	return `<style>${innerStyle}</style>`;
}

function transpileStaticRule(
	componentId: string,
	componentInstanceIds: Map<string, string>,
	rule: Extract<AstItem, { type: "rule" }>
) {
	const selector = generateStaticSelector(
		componentId,
		componentInstanceIds,
		rule.selectors
	);
	const body = rule.body.map((body) => body.property).join("");

	return `${selector}{${body}}`;
}

function transpileStaticAtRule(
	componentId: string,
	componentInstanceIds: Map<string, string>,
	atRule: Extract<AstItem, { type: "at-rule" }>
): string {
	const selector = atRule.query;

	const body = atRule.items
		.map((item) => {
			if (item.type === "rule")
				return transpileStaticRule(
					componentId,
					componentInstanceIds,
					item
				);
			return transpileStaticAtRule(
				componentId,
				componentInstanceIds,
				item
			);
		})
		.join("");

	return `${selector}{${body}}`;
}

function generateDynamicStyle(
	componentInstanceIds: Map<string, string>,
	items: AstItem[]
) {
	let innerStyle = "";

	for (const item of items) {
		if (item.type === "rule") {
			innerStyle += transpileDynamicRule(componentInstanceIds, item);
			continue;
		}
		innerStyle += transpileDynamicAtRule(componentInstanceIds, item);
	}

	return `<svelte:element this="style">{\`${innerStyle}\`}</svelte:element>`;
}

function transpileDynamicRule(
	componentInstanceIds: Map<string, string>,
	rule: Extract<AstItem, { type: "rule" }>
) {
	const selector = generateDynamicSelector(
		componentInstanceIds,
		rule.selectors
	);
	const body = rule.body.map((body) => body.property).join("");

	return `${selector}{${body}}`;
}

function transpileDynamicAtRule(
	componentInstanceIds: Map<string, string>,
	atRule: Extract<AstItem, { type: "at-rule" }>
): string {
	const selector = atRule.query;

	const body = atRule.items
		.map((item) => {
			if (item.type === "rule")
				return transpileDynamicRule(componentInstanceIds, item);
			return transpileDynamicAtRule(componentInstanceIds, item);
		})
		.join("");

	return `${selector}{${body}}`;
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
		return `:global(${selectorPart.reference.part}[data-sveltesheet-ids*="${componentId}"])`;

	const uniqueComponentId =
		componentInstanceIds.get(selectorPart.reference.component) ?? "";

	return `:global([data-sveltesheet-ids*="${uniqueComponentId}"]${selectorPart.reference.additionalSelector}[data-sveltesheet-ids*="${componentId}"])`;
}

function generateDynamicSelectorString(
	selectorPart: SelectorPart,
	componentInstanceIds: Map<string, string>
) {
	if (selectorPart.type === "combinator") return selectorPart.combinator;

	if (selectorPart.reference.type === "part")
		return `${selectorPart.reference.part}[data-sveltesheet-ids*="\${svelteCssRuntimeId}"]`;

	const uniqueComponentId =
		componentInstanceIds.get(selectorPart.reference.component) ?? "";

	return `[data-sveltesheet-ids*="${uniqueComponentId}"]${selectorPart.reference.additionalSelector}[data-sveltesheet-ids*="\${svelteCssRuntimeId}"]`;
}
