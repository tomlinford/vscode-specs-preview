# Specs Preview

A Visual Studio Code extension that displays all files from a `specs` folder in a preview pane with a clean, copy-pastable format and auto-refresh on file changes.

## Features

- Shows all files in the `specs` folder with titles.
- Auto-refreshes when files in `specs` are modified, added, or removed.
- Formats output as:
```
SPECS:
----

File: filename1
{filecontent}
----
File: filename2
{file content}
----
```
- Preserves formatting when copied.

## Usage

1. Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=tomlinford.specs-preview).
2. Create a `specs` folder in your workspace root.
3. Add some files to the `specs` folder.
4. Open the Command Palette (Ctrl+Shift+P) and run "Show Specs Preview".

## Installation

Install via the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=tomlinford.specs-preview) or search for "Specs Preview" in the VS Code Extensions view.

## License

MIT License - see [LICENSE](LICENSE) for details.