# kenga-window
Kenga popup window

## Install
To install `kenga-window` package to your project, type the following command:
`npm install kenga-window --save`

## Using
To use window you can write something like this: `const content = new Flow(); const w = new WindowPane(content); w.show();`

## Architecture
`WindowPane` can be minimized, maximized, restored, closed, panned by DnD and resized by DnD.

It fires events about minimizing, maximizing, restoring and closing.
It can be customized to be minimizable, maximizable, closable, decorated or undecorated.

Content of window should be specified with constructor call.

`WindowPane` has statis members intended to account all open windows. They use a `windowKey` passed to `WindowPane` as a second argument.
Also, `WindowPane` instances may be added as children to `DesktopPane` container to construct a MDI interface.
