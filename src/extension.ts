import * as vscode from 'vscode';
import { Parser, TokenType, TokenModifier } from 'laius/module/parser'

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

// let log = vscode.window.createOutputChannel('laius')
// log.appendLine(JSON.stringify())
const legend = (function () {
	const tokenTypesLegend = Object.keys(TokenType as any).filter(p => !(parseInt(p) >= 0))

	const tokenModifiersLegend = Object.keys(TokenModifier as any).filter(p => !(parseInt(p) >= 0))
	// log.appendLine(JSON.stringify(tokenModifiersLegend))

	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export function activate(context: vscode.ExtensionContext) {
	let dp = new DocumentSemanticTokensProvider()
	context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider(['laius', 'laius-markdown'], dp, legend));
}

interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

let all_diags = new WeakMap<vscode.Uri, vscode.DiagnosticCollection>()

class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

	// async provideDocumentRangeSemanticTokens(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken) {
	// 	let txt = document.getText(range)
	// 	log.appendLine(JSON.stringify(range))
	// 	log.appendLine('range')

	// 	const builder = new vscode.SemanticTokensBuilder();
	// 	return builder.build()
	// }

	async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
		// log.appendLine('hello ??!')
		let p = new Parser(document.getText())
		p.parse()
		// const allTokens = this._parseText(document.getText());

		if (p.errors.length) {
			// log.appendLine(`printing diagnostics (${p.errors.length})`)
			let diags = all_diags.get(document.uri) ?? vscode.languages.createDiagnosticCollection('laius')
			diags.clear()
			let dgs = p.errors.map(e => {
				return new vscode.Diagnostic(new vscode.Range(
					new vscode.Position(e.range.start.line, e.range.start.character),
					new vscode.Position(e.range.end.line, e.range.end.character),
				), e.message)
			})
			diags.set(document.uri, dgs)
			all_diags.set(document.uri, diags)
		} else {
			let diags = all_diags.get(document.uri)
			if (diags) { diags.clear() }
		}

		const builder = new vscode.SemanticTokensBuilder();
		// log.appendLine(JSON.stringify(p.semantic_tokens))
		let s = p.semantic_tokens
		for (let i = 0, l = s.length; i < l; i++) {
			let it = s[i]
			builder.push(it.line, it.char, it.length, it.type, it.mods)
		}
		return builder.build();
	}

}

// const selector = { language: 'html', scheme: 'file' }; // register for all Java documents from the local file system

// log.appendLine('registering...')
// vscode.languages.registerDocumentSemanticTokensProvider(selector, new DocumentSemanticTokensProvider(), legend);
