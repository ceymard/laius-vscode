"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const parser_1 = require("laius/module/parser");
let log = vscode.window.createOutputChannel('laius');
const legend = (function () {
    const tokenTypesLegend = [
        "string",
        "keyword",
        "operator",
        "type",
        "comment",
        "variable",
        "property",
        "macro",
        "namespace",
        "function",
        "number",
        "parameter",
    ];
    const tokenModifiersLegend = [
        "readonly",
        "defaultLibrary",
        "static",
    ];
    return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();
function activate(context) {
    log.appendLine("Adding subscription");
    context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider(['laius', 'laius-markdown'], new DocumentSemanticTokensProvider(), legend));
}
exports.activate = activate;
let all_diags = new WeakMap();
class DocumentSemanticTokensProvider {
    // async provideDocumentRangeSemanticTokens(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken) {
    // 	let txt = document.getText(range)
    // 	log.appendLine(JSON.stringify(range))
    // 	log.appendLine('range')
    // 	const builder = new vscode.SemanticTokensBuilder();
    // 	return builder.build()
    // }
    async provideDocumentSemanticTokens(document, token) {
        var _a;
        log.appendLine('hello ??!');
        let p = new parser_1.Parser(document.getText(), undefined, true);
        p.parse();
        // const allTokens = this._parseText(document.getText());
        if (p.errors.length) {
            // log.appendLine(`printing diagnostics (${p.errors.length})`)
            let diags = (_a = all_diags.get(document.uri)) !== null && _a !== void 0 ? _a : vscode.languages.createDiagnosticCollection('laius');
            diags.clear();
            let dgs = p.errors.map(e => {
                return new vscode.Diagnostic(new vscode.Range(new vscode.Position(e.range.start.line, e.range.start.character), new vscode.Position(e.range.end.line, e.range.end.character)), e.message);
            });
            diags.set(document.uri, dgs);
            all_diags.set(document.uri, diags);
        }
        else {
            let diags = all_diags.get(document.uri);
            if (diags) {
                diags.clear();
            }
        }
        const builder = new vscode.SemanticTokensBuilder();
        // log.appendLine(JSON.stringify(p.semantic_tokens))
        let s = p.semantic_tokens;
        for (let i = 0, l = s.length; i < l; i++) {
            let it = s[i];
            builder.push(it.line, it.char, it.length, it.type, it.mods);
        }
        return builder.build();
    }
}
//# sourceMappingURL=extension.js.map