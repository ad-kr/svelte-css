import { CssNode, ListItem, find, walk } from "css-tree";

export function filterStaticAst(ast: CssNode) {
	walk(ast, function (_, item, list) {
		if (!item) return;

		if (isItemDynamic(item)) list.remove(item);
	});

	clearAllEmptyBlocks(ast);
}

const codePattern = /\${(.*)}/g;

export function filterDynamicAst(ast: CssNode) {
	walk(ast, function (_, item, list) {
		if (!item) return;

		const isInsideAtRule =
			this.atrule?.block?.children.some(
				(subrule) => this.rule === subrule
			) ?? false;

		const isDeclaration = item.data.type === "Declaration";
		const isDynamicAtRule =
			isDeclaration &&
			isInsideAtRule &&
			this.atrule?.prelude?.type === "Raw" &&
			!!this.atrule.prelude.value.match(codePattern);

		if (isItemStatic(item) && !isDynamicAtRule) list.remove(item);
	});

	clearAllEmptyBlocks(ast);
}

function isItemDynamic(item: ListItem<CssNode>) {
	if (item.data.type === "Atrule" && item.data.prelude?.type === "Raw") {
		return !!item.data.prelude.value.match(codePattern);
	}
	if (item.data.type === "Declaration" && item.data.value.type === "Raw") {
		return !!item.data.value.value.match(codePattern);
	}
}

function isItemStatic(item: ListItem<CssNode>) {
	if (item.data.type === "Atrule" && item.data.prelude?.type === "Raw") {
		return !item.data.prelude.value.match(codePattern);
	}
	if (item.data.type === "Declaration") {
		if (item.data.value.type !== "Raw") return true;
		return !item.data.value.value.match(codePattern);
	}
}


function clearAllEmptyBlocks(ast: CssNode) {
	if (!hasEmptyBlocks(ast)) return;

	walk(ast, function (_, item, list) {
		if (!item) return;

		if ("block" in item.data) {
			const blockSize = item.data.block?.children.size;
			if (blockSize === 0) {
				list.remove(item);
			}
		}
	});

	clearAllEmptyBlocks(ast);
}

function hasEmptyBlocks(ast: CssNode) {
	const emptyBlocks = find(
		ast,
		(_, item) =>
			item && "block" in item.data && item.data.block?.children.size === 0
	);

	return emptyBlocks;
}
