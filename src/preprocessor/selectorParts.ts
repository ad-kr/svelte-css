import { CssNode, List, ListItem, Selector } from "css-tree";

export class SelectoParts {
	private parts: SelectorPart[] = [];

	constructor(private selector: Selector) {
		selector.children.forEach((child) => {
			if (child.type === "Combinator") {
				const combinatorPart = new SelectorPart("combinator");
				combinatorPart.add(child);
				this.parts.push(combinatorPart);
				return;
			}

			let lastPart = this.parts[this.parts.length - 1];

			if (lastPart === undefined || lastPart.isCombinator()) {
				lastPart = new SelectorPart("part");
				this.parts.push(lastPart);
			}

			lastPart.add(child);
		});
	}

	private apply() {
		const newChildren = this.parts.reduce(
			(acc, curr) => acc.appendList(curr.getNodes()),
			new List<CssNode>()
		);
		this.selector.children = newChildren;
	}

	public map(callback: (part: SelectorPart) => SelectorPart | null) {
		const mapped = this.parts.map(callback);
		const mappedWithoutNulls = mapped.filter(Boolean) as SelectorPart[];
		this.parts = mappedWithoutNulls;

		this.apply();
	}
}

class SelectorPart {
	private nodes = new List<CssNode>();
	constructor(private type: "combinator" | "part") {}

	public isCombinator() {
		return this.type === "combinator";
	}

	public getNodes() {
		return this.nodes;
	}

	public add(node: CssNode) {
		this.nodes.appendData(node);
	}

	public remove(node: ListItem<CssNode>) {
		this.nodes.remove(node);
	}

	public replace(nodes: List<CssNode>) {
		this.nodes = nodes;
	}

	public foreach(callback: (node: ListItem<CssNode>) => void) {
		this.nodes.forEach((_, item) => callback(item));
	}

	public addNode(node: CssNode) {
		if (this.isCombinator()) return;

		if (this.nodes.last?.type === "PseudoElementSelector") {
			const last = this.nodes.pop()?.data!;
			this.nodes.push(node);
			this.nodes.push(last);
			return;
		}

		this.nodes.push(node);
	}
}
