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

import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
// @ts-ignore
import { initVimMode } from "monaco-vim";

import {
  Button,
  Card,
  CardActions,
  CardHeader,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import {
  AddBoxOutlined as AddBoxOutlinedIcon,
  AddCircleOutlineOutlined as AddCircleOutlineOutlinedIcon,
  DisabledByDefaultOutlined as DisabledByDefaultOutlinedIcon,
  SaveOutlined as SaveOutlinedIcon,
  TerminalOutlined as TerminalOutlinedIcon,
} from "@mui/icons-material";

import {
  Config,
  ConfigPlugin,
  Notification,
  NotificationType,
} from "./lib/Protocol";

interface Args {
  config: Config | null;
  setConfig: React.Dispatch<React.SetStateAction<Config | null>>;
  setGlobalKeyboardShortcutsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
}

function Settings(args: Args) {
  const [dirty, setDirty] = React.useState(false);
  const [dialogPluginOpen, setDialogPluginOpen] = React.useState(false);
  const [extensionText, setExtensionText] = React.useState("");
  const [monacoEditor, setMonacoEditor] =
    React.useState<editor.IStandaloneCodeEditor | null>(null);
  const [plugins, setPlugins] = React.useState<ConfigPlugin[]>([]);
  const [vim, setVim] = React.useState<any>(null);

  function onBlurExtensions(_e: React.FocusEvent<HTMLInputElement>) {
    const extensions = extensionText
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
    args.setConfig({
      extensions,
      plugins,
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

  function onClickButtonCreateANewPlugin(
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setDialogPluginOpen(true);
    args.setGlobalKeyboardShortcutsEnabled(false);
  }

  function onClickDialogPluginButtonCancel(
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setDialogPluginOpen(false);
    args.setGlobalKeyboardShortcutsEnabled(true);
  }

  function onClickDialogPluginVimMode() {
    if (vim === null) {
      setVim(
        initVimMode(monacoEditor, document.querySelector(`.status-node-code`))
      );
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

  function onSubmitDialogPlugin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formObject = Object.fromEntries(formData.entries());
    if (monacoEditor) {
      formObject["code"] = monacoEditor.getValue();
    }
    setDialogPluginOpen(false);
    args.setGlobalKeyboardShortcutsEnabled(true);
  }

  React.useEffect(() => {
    if (args.config) {
      setExtensionText(args.config.extensions.join(", "));
      setPlugins(args.config.plugins);
    }
  }, [args.config]);

  return (
    <React.Fragment>
      <Stack spacing={2} sx={{ minHeight: "calc(100vh - 165px)" }}>
        <Card>
          <CardHeader
            title="Scan"
            titleTypographyProps={{ variant: "h5" }}
            sx={{ pt: "10px", pb: "0px" }}
          />
          <CardContent>
            <TextField
              label="Extensions"
              fullWidth
              size="small"
              value={extensionText}
              onChange={onChangeExtensionText}
              onBlur={onBlurExtensions}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title="Plugins"
            titleTypographyProps={{ variant: "h5" }}
            sx={{ pt: "10px", pb: "0px" }}
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center" sx={{ width: 48, maxWidth: 48 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>TODO</TableCell>
                    <TableCell>TODO</TableCell>
                    <TableCell>TODO</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
          <CardActions disableSpacing sx={{ padding: "0px 15px 15px 15px" }}>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              size="small"
              fullWidth={false}
              onClick={onClickButtonCreateANewPlugin}
              sx={{ textTransform: "none" }}
            >
              Create a New Plugin
            </Button>
          </CardActions>
        </Card>
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
      <Dialog
        open={dialogPluginOpen}
        aria-labelledby="plugin-dialog-title"
        aria-describedby="plugin-dialog-description"
        fullWidth={true}
        maxWidth="lg"
        PaperProps={{
          component: "form",
          onSubmit: onSubmitDialogPlugin,
        }}
      >
        <DialogTitle id="plugin-dialog-title">Create a New Plugin</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: "10px" }}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Name"
              type="text"
              size="small"
              fullWidth
              variant="outlined"
            />
            <TextField
              margin="dense"
              id="description"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              size="small"
              multiline
              minRows={3}
              maxRows={5}
            />
            <fieldset
              style={{ borderRadius: "5px", border: "1px solid lightgray" }}
            >
              <legend style={{ fontFamily: "roboto" }}>Code *</legend>
              <Editor
                height="calc(100vh - 440px)"
                language="javascript"
                onMount={onMountEditor}
                defaultValue=""
                theme="light"
                options={{
                  fontSize: 16,
                }}
              />
              <code
                className={`status-node-code`}
                style={{
                  padding: "3px",
                  backgroundColor: "lightgray",
                  marginTop: "3px",
                  color: "black",
                  display: "none",
                }}
              ></code>
            </fieldset>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant={vim ? "contained" : "outlined"}
            startIcon={<TerminalOutlinedIcon />}
            onClick={onClickDialogPluginVimMode}
            sx={{ textTransform: "none" }}
          >
            Vim Mode
          </Button>
          <Button
            type="submit"
            variant="outlined"
            startIcon={<AddBoxOutlinedIcon />}
            sx={{ textTransform: "none" }}
          >
            Create
          </Button>
          <Button
            variant="outlined"
            startIcon={<DisabledByDefaultOutlinedIcon />}
            onClick={onClickDialogPluginButtonCancel}
            color="error"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default Settings;
