/*
 *   Copyright (c) 2024. caoccao.com Sam Cao
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React from "react";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
// @ts-ignore
import { initVimMode } from "monaco-vim";

import Box from "@mui/material/Box";

import { BatchEditorType, Item } from "./lib/Protocol";

export interface Args {
  items: Item[];
  type: BatchEditorType;
}

function BatchEditor(args: Args) {
  const [vim, setVim] = React.useState<any>(null);

  function onMountEditor(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editor.addAction({
      id: `editor-${args.type}`,
      label: `Editor ${args.type}`,
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyS,
      ],
      run: function (editor: editor.ICodeEditor, ..._args: any[]): void {
        console.log("Save ", editor.getValue());
      },
    });
    // setVim(
    //   initVimMode(editor, document.querySelector(`.status-node-${args.type}`))
    // );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Editor
        height="80vh"
        language="plaintext"
        onMount={onMountEditor}
        defaultValue=""
        value={args.items
          .map((item) =>
            args.type === BatchEditorType.Source
              ? item.sourcePath
              : item.targetPath
          )
          .join("\n")}
        theme="light"
      />
      <code
        className={`status-node-${args.type}`}
        style={{ padding: "3px", backgroundColor: "lightblue", color: "black" }}
      ></code>
    </Box>
  );
}

export default BatchEditor;
