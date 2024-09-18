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

import { invoke } from "@tauri-apps/api/tauri";

import React from "react";

import { Stack, TextField } from "@mui/material";

import { Config, Notification, NotificationType } from "./lib/Protocol";

interface Args {
  config: Config | null;
  setConfig: React.Dispatch<React.SetStateAction<Config | null>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
}

function Settings(args: Args) {
  const [extensionText, setExtensionText] = React.useState<string>("");

  function onBlurExtensions(_e: React.FocusEvent<HTMLInputElement>) {
    const extensions = extensionText.split(",").map((e) => e.trim());
    invoke<Config>("set_config", {
      config: {
        extensions,
      },
    })
      .then((value) => {
        args.setNotification({
          message: "",
          type: NotificationType.None,
        });
        args.setConfig(value);
      })
      .catch((error) => {
        args.setNotification({
          message: `${error}`,
          type: NotificationType.Error,
        });
      });
  }

  function onChangeExtensionText(e: React.ChangeEvent<HTMLInputElement>) {
    setExtensionText(e.target.value);
  }

  React.useEffect(() => {
    if (args.config) {
      setExtensionText(args.config.extensions.join(","));
    }
  }, [args.config]);

  return (
    <Stack direction="row" spacing={2} sx={{ mt: "20px" }}>
      <TextField
        label="Extensions"
        fullWidth
        size="small"
        value={extensionText}
        onChange={onChangeExtensionText}
        onBlur={onBlurExtensions}
      />
    </Stack>
  );
}

export default Settings;
