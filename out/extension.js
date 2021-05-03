"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const parser_1 = require("laius/module/parser");
const tokenTypes = new Map();
const tokenModifiers = new Map();
let log = vscode.window.createOutputChannel('laius');
// log.appendLine(JSON.stringify())
const legend = (function () {
    const tokenTypesLegend = Object.keys(parser_1.TokenType).filter(p => !(parseInt(p) >= 0));
    // [
    // 	'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
    // 	'type', 'struct', 'class', 'interface', 'enum', 'typeParameter', 'function',
    // 	'method', 'macro', 'variable', 'parameter', 'property', 'label'
    // ];
    // tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));
    const tokenModifiersLegend = Object.keys(parser_1.TokenModifier).filter(p => !(parseInt(p) >= 0));
    log.appendLine(JSON.stringify(tokenModifiersLegend));
    // const tokenModifiersLegend = [
    // 	'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
    // 	'modification', 'async'
    // ];
    // tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));
    return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();
function activate(context) {
    // log.appendLine('WTF')
    let dp = new DocumentSemanticTokensProvider();
    context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider(['laius', { language: 'html' }], dp, legend));
    // context.subscriptions.push(vscode.languages.registerDocumentRangeSemanticTokensProvider(['laius', {language: 'html'}], dp, legend))
}
exports.activate = activate;
class DocumentSemanticTokensProvider {
    // async provideDocumentRangeSemanticTokens(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken) {
    // 	let txt = document.getText(range)
    // 	log.appendLine(JSON.stringify(range))
    // 	log.appendLine('range')
    // 	const builder = new vscode.SemanticTokensBuilder();
    // 	return builder.build()
    // }
    async provideDocumentSemanticTokens(document, token) {
        // log.appendLine('hello ??!')
        let p = new parser_1.Parser(document.getText());
        p.parse();
        // const allTokens = this._parseText(document.getText());
        const builder = new vscode.SemanticTokensBuilder();
        // log.appendLine(JSON.stringify(p.semantic_tokens))
        let s = p.semantic_tokens;
        for (let i = 0, l = s.length; i < l; i++) {
            let it = s[i];
            builder.push(it.line, it.char, it.length, it.type, it.mods);
        }
        // allTokens.forEach((token) => {
        // builder.push(token.line, token.startCharacter, token.length, this._encodeTokenType(token.tokenType), this._encodeTokenModifiers(token.tokenModifiers));
        // });
        return builder.build();
    }
    _encodeTokenType(tokenType) {
        if (tokenTypes.has(tokenType)) {
            return tokenTypes.get(tokenType);
        }
        else if (tokenType === 'notInLegend') {
            return tokenTypes.size + 2;
        }
        return 0;
    }
    _encodeTokenModifiers(strTokenModifiers) {
        let result = 0;
        for (let i = 0; i < strTokenModifiers.length; i++) {
            const tokenModifier = strTokenModifiers[i];
            if (tokenModifiers.has(tokenModifier)) {
                result = result | (1 << tokenModifiers.get(tokenModifier));
            }
            else if (tokenModifier === 'notInLegend') {
                result = result | (1 << tokenModifiers.size + 2);
            }
        }
        return result;
    }
    _parseText(text) {
        const r = [];
        log.appendLine('WHATTTT');
        const lines = text.split(/\r\n|\r|\n/);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let currentOffset = 0;
            do {
                const openOffset = line.indexOf('[', currentOffset);
                if (openOffset === -1) {
                    break;
                }
                const closeOffset = line.indexOf(']', openOffset);
                if (closeOffset === -1) {
                    break;
                }
                const tokenData = this._parseTextToken(line.substring(openOffset + 1, closeOffset));
                r.push({
                    line: i,
                    startCharacter: openOffset + 1,
                    length: closeOffset - openOffset - 1,
                    tokenType: tokenData.tokenType,
                    tokenModifiers: tokenData.tokenModifiers
                });
                currentOffset = closeOffset;
            } while (true);
        }
        return r;
    }
    _parseTextToken(text) {
        const parts = text.split('.');
        return {
            tokenType: parts[0],
            tokenModifiers: parts.slice(1)
        };
    }
}
// const selector = { language: 'html', scheme: 'file' }; // register for all Java documents from the local file system
log.appendLine('registering...');
// vscode.languages.registerDocumentSemanticTokensProvider(selector, new DocumentSemanticTokensProvider(), legend);
//# sourceMappingURL=extension.js.map