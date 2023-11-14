import { expect, test } from "vitest";
import { tokenize } from "../src/tokenizer";
import {
	parseReference,
	parseSelector,
	parseSelectors,
} from "../src/parser/parseSelector";
import { Parser } from "../src/parser/parser";
import { Selector, SelectorPart } from "../src/ast";

test("parseSelectors", () => {
	const tokens_with_multiple_selectors = tokenize(
		"div > :hover, ${Component} + ${OtherComponent} {"
	);

	const parser_with_multiple_selectors = new Parser(
		tokens_with_multiple_selectors
	);

	const result_with_multiple_selectors = parseSelectors(
		parser_with_multiple_selectors
	);

	expect(result_with_multiple_selectors.unwrap()).toStrictEqual([
		[
			{ type: "reference", reference: { type: "part", part: "div" } },
			{ type: "combinator", combinator: ">" },
			{ type: "reference", reference: { type: "part", part: ":hover" } },
		],
		[
			{
				type: "reference",
				reference: {
					type: "component",
					component: "Component",
					additionalSelector: "",
				},
			},
			{ type: "combinator", combinator: "+" },
			{
				type: "reference",
				reference: {
					type: "component",
					component: "OtherComponent",
					additionalSelector: "",
				},
			},
		],
	] satisfies Selector[]);
});

test("parseSelector", () => {
	const tokens_direct_child = tokenize("div > div ");

	const parser_direct_child = new Parser(tokens_direct_child);

	const result_direct_child = parseSelector(parser_direct_child);

	expect(result_direct_child.unwrap()).toStrictEqual([
		{ type: "reference", reference: { type: "part", part: "div" } },
		{ type: "combinator", combinator: ">" },
		{ type: "reference", reference: { type: "part", part: "div" } },
	] satisfies Selector);
});

test("parseReference", () => {
	const tokens_single = tokenize("div");
	const tokens_with_combinator = tokenize("div > div");
	const tokens_with_multiple_selectors = tokenize(
		'canvas:hover[data-structure="hello world <3"] ~ :hover'
	);
	const tokens_with_component = tokenize("${ComponentName}");
	const tokens_with_component_with_selectors = tokenize(
		'${ComponentName}:hover[data-structure="hello world"]{'
	);

	const parser_single = new Parser(tokens_single);
	const parser_with_combinator = new Parser(tokens_with_combinator);
	const parser_with_multiple_selectors = new Parser(
		tokens_with_multiple_selectors
	);
	const parser_with_component = new Parser(tokens_with_component);
	const parser_with_component_with_selectors = new Parser(
		tokens_with_component_with_selectors
	);

	const result_single = parseReference(parser_single);
	const result_with_combinator = parseReference(parser_with_combinator);
	const result_with_multiple_selectors = parseReference(
		parser_with_multiple_selectors
	);
	const result_with_component = parseReference(parser_with_component);
	const result_with_component_with_selectors = parseReference(
		parser_with_component_with_selectors
	);

	const divReference = {
		type: "reference",
		reference: { type: "part", part: "div" },
	} satisfies SelectorPart;

	expect(result_single.unwrap()).toStrictEqual(divReference);
	expect(result_with_combinator.unwrap()).toStrictEqual(divReference);
	expect(result_with_multiple_selectors.unwrap()).toStrictEqual({
		type: "reference",
		reference: {
			type: "part",
			part: 'canvas:hover[data-structure="hello world <3"]',
		},
	} satisfies SelectorPart);
	expect(result_with_component.unwrap()).toStrictEqual({
		type: "reference",
		reference: {
			type: "component",
			component: "ComponentName",
			additionalSelector: "",
		},
	} satisfies SelectorPart);
	expect(result_with_component_with_selectors.unwrap()).toStrictEqual({
		type: "reference",
		reference: {
			type: "component",
			component: "ComponentName",
			additionalSelector: ':hover[data-structure="hello world"]',
		},
	} satisfies SelectorPart);
});
