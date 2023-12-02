import { CssNode, walk } from "css-tree";
import { hash } from "../utils/hash";

export async function collectUniqueComponentIds(
	ast: CssNode,
	filename: string
) {
	const uniqueComponentIds = new Map<string, string>();

	walk(ast, function (node) {
		if (node.type === "PseudoClassSelector" && node.name === "code") {
			if (
				!node.children ||
				!node.children.first ||
				node.children.first.type !== "Raw"
			)
				return;

			uniqueComponentIds.set(node.children.first.value, "");
		}
	});

	// We have to call the hashing function from the walk function because the walk function doesn't seem to have an async version.
	const setPromises = Array.from(uniqueComponentIds).map(async ([key]) => {
		const uniqueId = (await hash(filename + key)).substring(0, 8);
		uniqueComponentIds.set(key, uniqueId);
	});
	await Promise.all(setPromises);

	return uniqueComponentIds;
}
