import { CssNode, generate, parse, walk } from "css-tree";

export function replaceCodeParts(css: string) {
	const ast = parse(css);

	let prevNode: CssNode;
	walk(ast, function (node) {
		if (node.type === "Block" && node.children.first?.type === "Raw") {
			if (prevNode.type === "Raw") {
				prevNode.value = prevNode.value.slice(0, -1);
			}

			// We're forcing node to accept these values, as I couldn't be bothered to do it properly.
			// @ts-ignore
			node.value = `:code(${node.children.first.value})`;
			// @ts-ignore
			node.type = "Raw";
		}
		prevNode = node;
	});

	return generate(ast);
}
