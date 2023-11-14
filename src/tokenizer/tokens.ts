export const chars = [
	// "$",
	// "<",
	">",
	"{",
	"}",
	// "(",
	// ")",
	";",
	":",
	// ".",
	// "#",
	// "^",
	"~",
	"+",
	// ".",
	// "|",
	",",
	'"',
	// "*",
	// "[",
	// "]",
	"'",
] as const;

export const keywords = ["@media"] as const;

export type Char = (typeof chars)[number];
export type Keyword = (typeof keywords)[number];

export type Token =
	| { type: "space" }
	| { type: "char"; char: Char }
	| { type: "portion"; portion: string }
	| { type: "code"; code: string }
	| { type: "string"; string: string }
