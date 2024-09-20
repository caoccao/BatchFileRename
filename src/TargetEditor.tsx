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

import { writeText } from "@tauri-apps/api/clipboard";

import React from "react";
import { Box, Button, Stack } from "@mui/material";
import {
  ContentCopyOutlined as ContentCopyOutlinedIcon,
  SaveOutlined as SaveOutlinedIcon,
  TerminalOutlined as TerminalOutlinedIcon,
} from "@mui/icons-material";

import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
// @ts-ignore
import { initVimMode } from "monaco-vim";

import { Item, Notification, NotificationType } from "./lib/Protocol";

export interface Args {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
}

function TargetEditor(args: Args) {
  const [monacoEditor, setMonacoEditor] =
    React.useState<editor.IStandaloneCodeEditor | null>(null);
  const [vim, setVim] = React.useState<any>(null);

  function onClickCopy() {
    if (monacoEditor) {
      writeText(monacoEditor.getValue());
    }
  }

  const onClickSave = React.useCallback(() => {
    if (monacoEditor) {
      const lines = monacoEditor
        .getValue()
        .split(/[\r\n]+/)
        .map((line) => line.trim());
      console.log(args.items);
      if (lines.length != args.items.length) {
        args.setNotification({
          message: `Line count ${lines.length} mismatches with item count ${args.items.length}.`,
          type: NotificationType.Error,
        });
      } else {
        args.setNotification({
          message: "",
          type: NotificationType.None,
        });
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
    }
  }, [args.items, monacoEditor]);

  function onClickVimMode() {
    if (vim === null) {
      setVim(initVimMode(monacoEditor, document.querySelector(`.status-node-target`)));
    } else {
      vim.dispose();
      setVim(null);
    }
  }

  function onMountEditor(
    monacoEditor: editor.IStandaloneCodeEditor,
    _monaco: Monaco
  ) {
    setMonacoEditor(monacoEditor);
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" spacing={2} sx={{ mb: "5px" }}>
        <Button
          variant="outlined"
          startIcon={<ContentCopyOutlinedIcon />}
          size="small"
          onClick={onClickCopy}
          sx={{ textTransform: "none" }}
        >
          Copy
        </Button>
        <Button
          variant="outlined"
          startIcon={<SaveOutlinedIcon />}
          size="small"
          onClick={onClickSave}
          sx={{ textTransform: "none" }}
        >
          Save
        </Button>
        <Button
          variant={vim ? "contained" : "outlined"}
          startIcon={<TerminalOutlinedIcon />}
          size="small"
          onClick={onClickVimMode}
          sx={{ textTransform: "none" }}
        >
          Vim Mode
        </Button>
      </Stack>
      <Editor
        height="calc(100vh - 200px)"
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
        className={`status-node-target`}
        style={{
          padding: "3px",
          backgroundColor: "lightgray",
          marginTop: "3px",
          color: "black",
          display: "none",
        }}
      ></code>
    </Box>
  );
}

export default TargetEditor;
