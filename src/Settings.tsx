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

import { Button, Stack, TextField } from "@mui/material";
import { SaveOutlined as SaveOutlinedIcon } from "@mui/icons-material";

import { Config, Notification, NotificationType } from "./lib/Protocol";

interface Args {
  config: Config | null;
  setConfig: React.Dispatch<React.SetStateAction<Config | null>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
}

function Settings(args: Args) {
  const [dirty, setDirty] = React.useState(false);
  const [extensionText, setExtensionText] = React.useState("");

  function onBlurExtensions(_e: React.FocusEvent<HTMLInputElement>) {
    const extensions = extensionText
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
    args.setConfig({
      extensions,
    });
  }

  const onClickSave = React.useCallback(() => {
    invoke<Config>("set_config", {
      config: args.config,
    })
      .then((value) => {
        args.setNotification({
          message: "",
          type: NotificationType.None,
        });
        args.setConfig(value);
        setDirty(false);
      })
      .catch((error) => {
        args.setNotification({
          message: `${error}`,
          type: NotificationType.Error,
        });
      });
  }, [args.config]);

  function onChangeExtensionText(e: React.ChangeEvent<HTMLInputElement>) {
    setDirty(true);
    setExtensionText(e.target.value);
  }

  React.useEffect(() => {
    if (args.config) {
      setExtensionText(args.config.extensions.join(", "));
    }
  }, [args.config]);

  return (
    <Stack spacing={2} sx={{ mt: "20px" }}>
      <TextField
        label="Extensions"
        fullWidth
        size="small"
        value={extensionText}
        onChange={onChangeExtensionText}
        onBlur={onBlurExtensions}
      />
      <Button
        variant="outlined"
        startIcon={<SaveOutlinedIcon />}
        onClick={onClickSave}
        size="small"
        disabled={!dirty}
        fullWidth={false}
        sx={{ textTransform: "none", width: "120px" }}
      >
        Save
      </Button>
    </Stack>
  );
}

export default Settings;
