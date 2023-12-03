import { CssNode, List, walk } from "css-tree";

/** Takes dynamic ast and processes `@css` at rules and `css` properties */
export function unwrapDynamicCssValues(ast: CssNode) {
	walk(ast, function (_, item, list) {
		if (item?.data.type === "Declaration" && item.data.property === "css") {
			const nodeList = new List<CssNode>().appendData(item.data.value);
			list.replace(item, nodeList);
		}

		if (
			item?.data.type === "Atrule" &&
			item.data.name === "css" &&
			item.data.prelude?.type === "Raw"
		) {
			const node = item.data.prelude;
			node.value = `\${${node.value.slice(6, node.value.length - 1)}}`; // We're assuming that the values starts with `:code(` and ends with `)`
			const nodeList = new List<CssNode>().appendData(node);
			list.replace(item, nodeList);
		}
	});
}
