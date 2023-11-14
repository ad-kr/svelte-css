import { Result, err, ok } from "outwrap";
import { Reference, Selector, SelectorPart } from "../ast";
import { Char } from "../tokenizer/tokens";
import { TokenWrapper } from "../tokenizer/utils";
import { Parser } from "./parser";

export function parseSelectors(p: Parser): Result<Selector[], string> {
	const selectors: Selector[] = [];

	p.skipWhitespace();

	while (true) {
		const selector = parseSelector(p);

		if (selector.isErr()) return selector;

		selectors.push(selector.unwrap());

		if (p.peek().isExactChar(",")) {
			p.consume();
			continue;
		}

		break;
	}

	return ok(selectors);
}

export function parseSelector(p: Parser): Result<Selector, string> {
	const selectorParts: SelectorPart[] = [];

	p.skipWhitespace();

	while (true) {
		const selectorPart = parseReference(p);

		if (selectorPart.isErr()) return selectorPart;
		selectorParts.push(selectorPart.unwrap());

		if (isCombinator(p.peek())) {
			const combinator = parseCombinator(p);

			if (combinator.isErr()) return combinator;

			if (isValidReferenceStart(p.peek())) {
				selectorParts.push(combinator.unwrap());
				continue;
			}
		}

		break;
	}

	return ok(selectorParts);
}

function parseCombinator(p: Parser): Result<SelectorPart, string> {
	let combinator = p.next();

	if (!isCombinator(combinator)) return err("Expected combinator");

	if (combinator.isSpace() && isCombinator(p.peek())) {
		combinator = p.next();
	}

	if (p.peek().isSpace()) {
		p.consume();
	}

	// We know that this one is a combinator
	const typesafe_combinator = combinator as
		| TokenWrapper<{
				type: "char";
				char: (typeof validCombinatorChars)[number];
		  }>
		| TokenWrapper<{ type: "space" }>;

	return ok({
		type: "combinator",
		combinator: typesafe_combinator.isSpace()
			? " "
			: typesafe_combinator.get().char,
	});
}

export function parseReference(p: Parser): Result<SelectorPart, string> {
	let peeked = p.peek();

	if (!isValidReferenceStart(peeked))
		return err("Selector must start with a valid character");

	const reference = peeked.isCode()
		? parseComponentReference(p)
		: parsePartReference(p);

	if (reference.isErr()) return reference;

	return ok({ type: "reference", reference: reference.unwrap() });
}

function parseComponentReference(p: Parser): Result<Reference, string> {
	let next = p.next();

	if (!next.isCode()) return err("Expected component name"); // TODO: Return error, expected code token

	let additionalSelector = "";
	if (p.peek().isPortion() || p.peek().isExactChar(":")) {
		const part = parsePartReference(p);

		if (part.isErr()) return part; // TODO: Return error, expected selector behind component reference

		const unwrapped = part.unwrap();
		if (unwrapped.type === "component")
			return err("Part parser returned a component! WTF??");

		additionalSelector = unwrapped.part;
	}

	return ok({
		type: "component",
		component: next.get().code,
		additionalSelector,
	});
}

function parsePartReference(p: Parser): Result<Reference, string> {
	let part = "";

	while (true) {
		const next = p.next();

		if (!next.isPortion() && !next.isExactChar(":"))
			return err("Expected selector");

		part += next.isPortion() ? next.get().portion : next.get().char;

		if (p.peek().isString()) {
			const string = p.next().as<"string">();
			const portionAfterString = p.next();

			if (!portionAfterString.isPortion())
				return err("Expected selector portion after string");

			part += `"${string.get().string}"`;
			part += portionAfterString.get().portion;
		}

		if (
			p.peek().isUndefined() ||
			p.peek().isEitherChar([",", "{"]) ||
			isCombinator(p.peek())
		)
			break;
	}

	return ok({ type: "part", part });
}

const validCombinatorChars = [">", "+", "~"] satisfies Char[];
function isCombinator(token: TokenWrapper) {
	if (token.isSpace()) return true;
	return token.isEitherChar(validCombinatorChars);
}

function isValidReferenceStart(token: TokenWrapper) {
	return token.isPortion() || token.isCode() || token.isExactChar(":");
}
