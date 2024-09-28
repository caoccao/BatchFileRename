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

import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";

import { Box, Button, ButtonGroup, Stack, Tooltip } from "@mui/material";
import { ContentCopyOutlined as ContentCopyOutlinedIcon } from "@mui/icons-material";

import { Item } from "./lib/Protocol";

export interface Args {
  items: Item[];
}

function SourceEditor(args: Args) {
  const [monacoEditor, setMonacoEditor] =
    React.useState<editor.IStandaloneCodeEditor | null>(null);

  function onClickCopy() {
    if (monacoEditor) {
      writeText(monacoEditor.getValue());
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
        <ButtonGroup variant="outlined">
          <Tooltip arrow title="Copy">
            <Button variant="outlined" size="small" onClick={onClickCopy}>
              <ContentCopyOutlinedIcon fontSize="small" />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Stack>
      <Editor
        height="calc(100vh - 200px)"
        language="plaintext"
        onMount={onMountEditor}
        defaultValue=""
        value={args.items.map((item) => item.sourcePath).join("\n")}
        theme="light"
        options={{
          fontSize: 16,
          readOnly: true,
        }}
      />
    </Box>
  );
}

export default SourceEditor;
