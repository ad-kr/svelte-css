import { Char, Keyword, Token, chars, keywords } from "./tokens";

export function isChar(char: string | undefined): char is Char {
	if (char === undefined) return false;
	return chars.includes(char as Char);
}

export function isKeyword(string: string): string is Keyword {
	return keywords.includes(string as Keyword);
}

export class TokenWrapper<T extends Token | undefined = Token | undefined> {
	constructor(private token: T) {}

	public get() {
		return this.token;
	}

	public toCssString(): string {
		switch (this.token?.type) {
			case undefined:
				return "/* undefined */";
			case "char":
				return this.token.char;
			case "code":
				return "${" + this.token.code + "}";
			case "portion":
				return this.token.portion;
			case "space":
				return " ";
			case "string":
				return `"${this.token.string}"`;
		}
	}

	public isUndefined(): this is TokenWrapper<undefined> {
		return this.token === undefined;
	}

	public isNotUndefined(): this is TokenWrapper<Token> {
		return this.token !== undefined;
	}

	public isSpace(): this is TokenWrapper<{ type: "space" }> {
		if (this.token === undefined) false;
		return this.token?.type === "space";
	}

	public isPortion(): this is TokenWrapper<{
		type: "portion";
		portion: string;
	}> {
		if (this.token === undefined) return false;
		return this.token.type === "portion";
	}

	public isCode(): this is TokenWrapper<{
		type: "code";
		code: string;
	}> {
		if (this.token === undefined) return false;
		return this.token.type === "code";
	}

	public isString(): this is TokenWrapper<{
		type: "string";
		string: string;
	}> {
		if (this.token === undefined) return false;
		return this.token.type === "string";
	}

	public isChar(): this is TokenWrapper<{
		type: "char";
		char: Char;
	}> {
		if (this.token === undefined) return false;
		return this.token.type === "char";
	}

	public isExactChar<T extends Char>(
		char: T
	): this is TokenWrapper<{ type: "char"; char: T }> {
		if (!this.isChar()) return false;
		return this.token.char === char;
	}

	public isEitherChar<T extends Char[]>(
		either: T
	): this is TokenWrapper<{ type: "char"; char: T[number] }> {
		if (!this.isChar()) return false;
		return either.includes(this.token.char);
	}

	/** Tells Typescript that the token is of certain type.
	 *
	 * Use only if you know for certain that the token is of certaint type.
	 */
	public as<K extends Token["type"]>(): TokenWrapper<
		Extract<Token, { type: K }>
	> {
		return this as any as TokenWrapper<Extract<Token, { type: K }>>;
	}
}
