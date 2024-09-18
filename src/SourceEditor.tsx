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

import Editor from "@monaco-editor/react";

import Box from "@mui/material/Box";

import { Item } from "./lib/Protocol";

export interface Args {
  items: Item[];
}

function SourceEditor(args: Args) {
  return (
    <Box sx={{ width: "100%" }}>
      <Editor
        height="80vh"
        language="plaintext"
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
