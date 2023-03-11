// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";
import { url } from 'inspector';
import { BaseAPI } from 'openai/dist/base';

function extractCodeFromMarkdown(markdown: string, language: number ) {

    let start = markdown.search("```")
    let end = markdown.slice(start+1).search("```")
    return markdown.slice(start+language + 3, end+2)
}




async function aiReq(questionForGPT: string) {
    let configuration = new Configuration({
        apiKey: "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"     
    })
    let openai = new OpenAIApi(configuration);
    return openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": questionForGPT }],
        temperature: 0.1
    })

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
        let response = ""
        vscode.window.showInformationMessage('Hello World from CodeImprover!');
        let text = editor?.document.getText(selection);
        let improvements = `Respond using markdown and write only code. Better ways to write this in ${language}: ${text}`
        aiReq(improvements).then((res) => {
            
            let response = res.data.choices[0].message?.content as string
            response = extractCodeFromMarkdown(response, language?.length as number)
            vscode.window.showInformationMessage(response);
            let pasteSuggestion = vscode.commands.registerCommand('codeimprover.pasteSuggestion', () => {
                if (selection) {
                    console.log("intra ")
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

        }).catch((err) => console.log(err))
        


});


context.subscriptions.push(disposable);


}

// This method is called when your extension is deactivated
export function deactivate() {}
