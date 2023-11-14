import { Token } from "../tokenizer/tokens";
import { TokenWrapper } from "../tokenizer/utils";

export class Parser {
	constructor(private tokens: Token[]) {}

	public next() {
		return new TokenWrapper(this.tokens.shift());
	}

	public peek() {
		return new TokenWrapper(this.tokens[0]);
	}

	public consume() {
		this.tokens.shift();
	}

	public skipWhitespace() {
		while (true) {
			const peeked = this.peek();

			if (!peeked.isSpace()) break;

			this.consume();
		}
	}

	public isEmpty() {
		return this.tokens.length === 0;
	}
}
