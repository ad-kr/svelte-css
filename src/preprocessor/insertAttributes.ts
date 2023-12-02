import { CssNode, List, walk } from "css-tree";
import { SelectoParts } from "./selectorParts";

export function insertStaticAttributes(
	ast: CssNode,
	uniqueComponentIds: Map<string, string>
) {
	walk(ast, function (node) {
		if (node.type !== "Selector") return;

		const selectorParts = new SelectoParts(node);

		selectorParts.map((part) => {
			if (part.isCombinator()) return part;

			let hasCode = false;
			part.foreach((node) => {
				if (
					node.data.type === "PseudoClassSelector" &&
					node.data.name === "code" &&
					node.data.children?.first?.type === "Raw"
				) {
					hasCode = true;
					const componentName = node.data.children.first.value;
					const componentId =
						uniqueComponentIds.get(componentName) ?? "";
					const attribute = createAttribute(
						"data-sveltesheet-ids",
						"*=",
						componentId
					);
					part.addNode(attribute.data);
					part.remove(node);
				}
			});

			if (hasCode) {
				const children = part.getNodes();
				const globalSelector = createGlobal(children);
				const newList = new List<CssNode>().append(globalSelector);
				part.replace(newList);
			}

			return part;
		});
	});
}

export function insertDynamicAttributes(
	ast: CssNode,
	uniqueComponentIds: Map<string, string>
) {
	walk(ast, function (node) {
		if (node.type !== "Selector") return;

		const selectorParts = new SelectoParts(node);

		selectorParts.map((part) => {
			if (part.isCombinator()) return part;

			part.addNode(
				createAttribute(
					"data-sveltesheet-ids",
					"*=",
					"${svelteCssRuntimeId}"
				).data
			);

			part.foreach((node) => {
				if (
					node.data.type === "PseudoClassSelector" &&
					node.data.name === "code" &&
					node.data.children?.first?.type === "Raw"
				) {
					const componentName = node.data.children.first.value;
					const componentId =
						uniqueComponentIds.get(componentName) ?? "";
					const attribute = createAttribute(
						"data-sveltesheet-ids",
						"*=",
						componentId
					);
					part.addNode(attribute.data);
					part.remove(node);
				}
			});

			return part;
		});
	});
}

function createAttribute(name: string, matcher: string, value: string) {
	const tempList = new List<CssNode>();
	const item = tempList.createItem({
		type: "AttributeSelector",
		name: {
			type: "Identifier",
			name,
		},
		matcher,
		value: { type: "String", value },
		flags: null,
	});
	return item;
}

function createGlobal(content: List<CssNode>) {
	const tempList = new List<CssNode>();
	const item = tempList.createItem({
		type: "PseudoClassSelector",
		name: "global",
		children: content.copy(),
	});
	return item;
}
