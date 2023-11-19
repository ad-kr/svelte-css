import { Token } from "../tokenizer/tokens";

export type AstItem =
	| { type: "rule"; selectors: Selector[]; body: RuleBody }
	| {
			type: "at-rule";
			query: { type: "static" | "dynamic"; queryTokens: Token[] };
			items: AstItem[];
	  };

//TODO: Replace SelectorPart with tokens, just like queryTokens?
export type Selector = SelectorPart[];

export type Reference =
	| { type: "part"; part: string }
	| { type: "component"; component: string; additionalSelector: string };
export type SelectorPart =
	| { type: "combinator"; combinator: ">" | "+" | "~" | " " }
	| { type: "reference"; reference: Reference };

export type RuleBody = Property[];

export type Property = { type: "static" | "dynamic"; property: string };
