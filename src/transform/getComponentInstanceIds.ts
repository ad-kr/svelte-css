import { AstItem } from "../ast";
import { hash } from "../utils/hash";

export async function getUniqueComponentIds(
	filename: string,
	items: AstItem[]
) {
	const componentInstanceIds = new Map<string, string>();

	for (const item of items) {
		if (item.type === "rule") {
			await addUniqueComponentsFromRule(
				item,
				filename,
				componentInstanceIds
			);
			continue;
		}
		await addUniqueComponentsFromAtRule(
			item,
			filename,
			componentInstanceIds
		);
	}

	return componentInstanceIds;
}

async function addUniqueComponentsFromAtRule(
	atRule: Extract<AstItem, { type: "at-rule" }>,
	filename: string,
	componentInstanceIds: Map<string, string>
) {
	for (const item of atRule.items) {
		if (item.type === "rule") {
			await addUniqueComponentsFromRule(
				item,
				filename,
				componentInstanceIds
			);
			continue;
		}
		await addUniqueComponentsFromAtRule(
			item,
			filename,
			componentInstanceIds
		);
	}
}

async function addUniqueComponentsFromRule(
	rule: Extract<AstItem, { type: "rule" }>,
	filename: string,
	componentInstanceIds: Map<string, string>
) {
	const selectoParts = rule.selectors.flatMap((selector) => selector.flat());

	for (const selectorPart of selectoParts) {
		if (selectorPart.type === "combinator") continue;
		if (selectorPart.reference.type !== "component") continue;
		componentInstanceIds.set(
			selectorPart.reference.component,
			await hash(selectorPart.reference.component + filename ?? "")
		);
	}
}
