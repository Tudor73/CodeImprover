// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";
import { url } from 'inspector';
import { BaseAPI } from 'openai/dist/base';


async function aiReq(questionForGPT: string) {
    let configuration = new Configuration({
        apiKey: "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"        
    })
    let openai = new OpenAIApi(configuration);
    return openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": questionForGPT }],
        temperature: 0.2
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

	
	let disposable = vscode.commands.registerCommand('codeimprover.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		const editor = vscode.window.activeTextEditor;
		const language = editor?.document.languageId
		const selection = editor?.selection;
        let text = ""
		if (selection) {
			text = editor.document.getText(selection);
			console.log(text);
		}
        vscode.window.showInformationMessage('Hello World from CodeImprover!');

        let improvements = `Write only code. Better ways to write this in ${language}: ${text}`
        aiReq(improvements).then((res) => {
            const response = res.data.choices[0].message?.content as string
            vscode.window.showInformationMessage(response);

        }).catch((err) => console.log(err))
        

	context.subscriptions.push(disposable);
});
}

// This method is called when your extension is deactivated
export function deactivate() {}
