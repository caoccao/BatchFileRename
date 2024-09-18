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
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
// @ts-ignore
import { initVimMode } from "monaco-vim";

import Box from "@mui/material/Box";

import { BatchEditorType, Item } from "./lib/Protocol";

export interface Args {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

function TargetEditor(args: Args) {
  const [monacoEditor, setMonacoEditor] =
    React.useState<editor.IStandaloneCodeEditor | null>(null);
  const [vim, setVim] = React.useState<any>(null);
  const [vimMode, setVimMode] = React.useState(false);

  function onMountEditor(
    monacoEditor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    setMonacoEditor(monacoEditor);
    monacoEditor.addAction({
      id: `target-editor`,
      label: `Target Editor`,
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyS,
      ],
      run: function (monacoEditor: editor.ICodeEditor, ..._args: any[]): void {
        const lines = monacoEditor
          .getValue()
          .split(/[\r\n]+/)
          .map((line) => line.trim());
        if (lines.length != args.items.length) {
          // TODO
          console.error("Error: items length mismatches.");
        } else {
          args.setItems(
            args.items.map((item, i) => {
              return {
                sourcePath: item.sourcePath,
                targetPath: lines[i],
                type: item.type,
              };
            })
          );
        }
      },
    });
  }

  function onClickVimMode() {
    if (vim === null) {
      setVim(initVimMode(monacoEditor, document.querySelector(`.status-node`)));
      setVimMode(true);
    } else {
      vim.dispose();
      setVim(null);
      setVimMode(false);
    }
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <FormGroup>
          <Tooltip
            title="Vim Mode (Not Ready)"
            arrow
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -10],
                    },
                  },
                ],
              },
            }}
          >
            <FormControlLabel
              control={<Checkbox checked={vimMode} onClick={onClickVimMode} />}
              label="Vim Mode"
            />
          </Tooltip>
        </FormGroup>
      </Stack>
      <Editor
        height="80vh"
        language="plaintext"
        onMount={onMountEditor}
        defaultValue=""
        value={args.items.map((item) => item.targetPath).join("\n")}
        theme="light"
        options={{
          fontSize: 16,
        }}
      />
      <code
        className={`status-node`}
        style={{ padding: "3px", backgroundColor: "lightgray", marginTop: "3px", color: "black" }}
      ></code>
    </Box>
  );
}

export default TargetEditor;
