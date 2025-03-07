// extension.js
var vscode = require("vscode");
function activate(context) {
  console.log("Specs Preview extension is active");
  let disposable = vscode.commands.registerCommand("specsPreview.showPreview", async () => {
    const panel = vscode.window.createWebviewPanel(
      "specsPreview",
      "Specs Preview",
      vscode.ViewColumn.One,
      {}
    );
    let watcher;
    const getSpecsContent = async () => {
      try {
        const workspaceFolders2 = vscode.workspace.workspaceFolders;
        if (!workspaceFolders2) {
          return { error: "No workspace folder open" };
        }
        const specsFolderUri = vscode.Uri.joinPath(workspaceFolders2[0].uri, "specs");
        let files;
        try {
          files = await vscode.workspace.fs.readDirectory(specsFolderUri);
        } catch (error) {
          if (error.code === "FileNotFound") {
            return { error: 'No "specs" folder found in workspace' };
          }
          throw error;
        }
        let textContent = "SPECS:\n----\n";
        for (const [fileName, fileType] of files) {
          if (fileType === vscode.FileType.File) {
            const fileUri = vscode.Uri.joinPath(specsFolderUri, fileName);
            let content;
            const openDoc = vscode.workspace.textDocuments.find(
              (doc) => doc.uri.toString() === fileUri.toString() && doc.isDirty
            );
            if (openDoc) {
              content = openDoc.getText();
            } else {
              const fileContent = await vscode.workspace.fs.readFile(fileUri);
              content = new TextDecoder().decode(fileContent);
            }
            textContent += `
File: ${fileName}
${content}
----
`;
          }
        }
        return { content: textContent };
      } catch (error) {
        return { error: `Error loading specs: ${error.message}` };
      }
    };
    const updateWebview = async () => {
      const result = await getSpecsContent();
      if (result.error) {
        panel.webview.html = getErrorHtml(result.error);
      } else {
        panel.webview.html = getWebviewContent(result.content);
      }
    };
    await updateWebview();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      const specsFolderUri = vscode.Uri.joinPath(workspaceFolders[0].uri, "specs");
      watcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(specsFolderUri, "*")
      );
      watcher.onDidChange(() => updateWebview());
      watcher.onDidCreate(() => updateWebview());
      watcher.onDidDelete(() => updateWebview());
      panel.onDidDispose(() => {
        if (watcher) {
          watcher.dispose();
        }
      }, null, context.subscriptions);
      const textChangeListener = vscode.workspace.onDidChangeTextDocument((e) => {
        const uri = e.document.uri;
        if (uri.toString().startsWith(specsFolderUri.toString())) {
          updateWebview();
        }
      });
      panel.onDidDispose(() => {
        textChangeListener.dispose();
      }, null, context.subscriptions);
    }
  });
  context.subscriptions.push(disposable);
}
function getWebviewContent(textContent) {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    padding: 20px; 
                    margin: 0;
                }
                pre { 
                    white-space: pre-wrap; 
                    word-wrap: break-word; 
                    margin: 0;
                }
            </style>
        </head>
        <body>
            <pre>${escapeHtml(textContent)}</pre>
        </body>
        </html>
    `;
}
function getErrorHtml(message) {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { padding: 20px; margin: 0; }
                .error { color: #ff5555; }
            </style>
        </head>
        <body>
            <div class="error">${escapeHtml(message)}</div>
        </body>
        </html>
    `;
}
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "'").replace(/'/g, "'");
}
function deactivate() {
}
module.exports = {
  activate,
  deactivate
};
