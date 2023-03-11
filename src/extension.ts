// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";
const fetch = require('node-fetch');

function extractCodeFromMarkdown(markdown: string, language: number ) {

    let start = markdown.search("```")
    let end = markdown.slice(start+1).search("```")
    return markdown.slice(start+language + 3, end+2)
}


var response = ""


async function aiReq(code: string, language: string) {
    return await fetch("https://hackathon-production-6f8c.up.railway.app/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "code": code,
            "language": language
        })
    });
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeimprover" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

    vscode.window.showInformationMessage("Login to Github", "Login", "no").then((res) => { 
        if (res === "Login") {
            vscode.env.openExternal(vscode.Uri.parse("https://github.com"))
        }
        else {
            vscode.window.showInformationMessage("You can't use this extension without logging in to Github")
        }
    })
	


	let disposable = vscode.commands.registerCommand('codeimprover.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		const editor = vscode.window.activeTextEditor;
		const language = editor?.document.languageId
		const selection = editor?.selection;
        vscode.window.showInformationMessage('Hello World from CodeImprover!');
        let text = editor?.document.getText(selection);
        let improvements = `Respond using markdown and write only code. Better ways to write this in ${language}: ${text}`
        aiReq(text as string, language as string).then((res) => {return res.json()}).then(res => {
            response = extractCodeFromMarkdown(res.suggestion, language?.length as number)
            vscode.window.showInformationMessage(response);
            let pasteSuggestion = vscode.commands.registerCommand('codeimprover.pasteSuggestion', () => {
                if (selection) {
                    console.log("selection", selection)
                    console.log("response", response)
                    // vscode.window.showTextDocument(editor?.document, editor?.viewColumn, true)
                    // editor.insertSnippet(new vscode.SnippetString("asdadasdasd1111111"), selection.start, { undoStopBefore: true, undoStopAfter: false })
                    editor.edit(builder => {
                        builder.replace(selection, response);
                    })
                    .then(success => {
                        console.log("success:", success);
                        var postion = editor.selection.end; 
                        editor.selection = new vscode.Selection(postion, postion);
                    });
            }});
            context.subscriptions.push(pasteSuggestion);
       
        })

});



context.subscriptions.push(disposable);


}

// This method is called when your extension is deactivated
export function deactivate() {}
