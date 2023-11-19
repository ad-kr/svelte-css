import { AstItem } from "../ast";
import { hash } from "../utils/hash";

export async function getUniqueComponentIds(
	filename: string,
	items: AstItem[]
) {
	const componentInstanceIds = new Map<string, string>();

	const selectorParts = items.flatMap((rule) =>
		rule.type === "rule" ? rule.selectors.flat() : []
	);

	for (const selectorPart of selectorParts) {
		if (
			selectorPart.type === "reference" &&
			selectorPart.reference.type === "component"
		)
			componentInstanceIds.set(
				selectorPart.reference.component,
				await hash(selectorPart.reference.component + filename ?? "")
			);
	}

	return componentInstanceIds;
}
