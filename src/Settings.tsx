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
import { confirm } from "@tauri-apps/api/dialog";

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
  IconButton,
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
  EditNoteOutlined as EditNoteOutlinedIcon,
  HighlightOffOutlined as HighlightOffOutlinedIcon,
  SaveOutlined as SaveOutlinedIcon,
  TerminalOutlined as TerminalOutlinedIcon,
} from "@mui/icons-material";

import {
  Config,
  ConfigPlugin,
  ConfigPluginOption,
  Notification,
  NotificationType,
} from "./lib/Protocol";

interface Args {
  config: Config | null;
  setConfig: React.Dispatch<React.SetStateAction<Config | null>>;
  setGlobalKeyboardShortcutsEnabled: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
}

function Settings(args: Args) {
  const [dirty, setDirty] = React.useState(false);
  const [dialogPluginOpen, setDialogPluginOpen] = React.useState(false);
  const [extensionText, setExtensionText] = React.useState("");
  const [monacoEditor, setMonacoEditor] =
    React.useState<editor.IStandaloneCodeEditor | null>(null);
  const [plugins, setPlugins] = React.useState<ConfigPlugin[]>([]);
  const [pluginCode, setPluginCode] = React.useState("");
  const [pluginDescription, setPluginDescription] = React.useState("");
  const [pluginDirty, setPluginDirty] = React.useState(false);
  const [pluginIndex, setPluginIndex] = React.useState(-1);
  const [pluginName, setPluginName] = React.useState("");
  const [pluginOptions, setPluginOptions] = React.useState<
    ConfigPluginOption[]
  >([]);
  const [vim, setVim] = React.useState<any>(null);

  function onBlurExtensions(_event: React.FocusEvent<HTMLInputElement>) {
    const extensions = extensionText
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
    args.setConfig({
      extensions,
      plugins,
    });
  }

  function onChangeExtensionText(e: React.ChangeEvent<HTMLInputElement>) {
    setDirty(true);
    setExtensionText(e.target.value);
  }

  function onChangePluginCode(
    _value: string | undefined,
    _event: editor.IModelContentChangedEvent
  ) {
    setPluginDirty(true);
  }

  const onChangePluginDescription = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPluginDirty(true);
      setPluginDescription(event.target.value);
    },
    [pluginDescription]
  );

  const onChangePluginName = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPluginDirty(true);
      setPluginName(event.target.value);
    },
    [pluginName]
  );

  const onChangePluginOptionDefaultValue = React.useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number
    ) => {
      if (index >= 0 && index < pluginOptions.length) {
        setPluginDirty(true);
        setPluginOptions([
          ...pluginOptions.slice(0, index),
          { ...pluginOptions[index], defaultValue: event.target.value },
          ...pluginOptions.slice(index + 1),
        ]);
      }
    },
    [pluginOptions]
  );

  const onChangePluginOptionName = React.useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number
    ) => {
      if (index >= 0 && index < pluginOptions.length) {
        setPluginDirty(true);
        setPluginOptions([
          ...pluginOptions.slice(0, index),
          { ...pluginOptions[index], name: event.target.value },
          ...pluginOptions.slice(index + 1),
        ]);
      }
    },
    [pluginOptions]
  );

  function onClickButtonAddPluginOption(
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    setDirty(true);
    setPluginOptions([
      ...pluginOptions.filter(
        (options) =>
          options.name &&
          options.name !== "" &&
          options.defaultValue &&
          options.defaultValue !== ""
      ),
      { name: "", defaultValue: "" },
    ]);
  }

  function onClickButtonCreateANewPlugin(
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setPluginCode("");
    setPluginDescription("");
    setPluginIndex(-1);
    setPluginName("");
    setPluginOptions([]);
    setDialogPluginOpen(true);
    args.setGlobalKeyboardShortcutsEnabled(false);
  }

  const onClickButtonDeletePlugin = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < plugins.length) {
        setPlugins(plugins.filter((_, i) => i !== index));
      }
    },
    [plugins]
  );

  const onClickButtonDeletePluginOption = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < pluginOptions.length) {
        setDirty(true);
        setPluginOptions(pluginOptions.filter((_, i) => i !== index));
      }
    },
    [pluginOptions]
  );

  const onClickButtonEditPlugin = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < plugins.length) {
        setPluginCode(plugins[index].code);
        setPluginDescription(plugins[index].description);
        setPluginIndex(index);
        setPluginName(plugins[index].name);
        setPluginOptions(plugins[index].options);
        setPluginDirty(false);
        setDialogPluginOpen(true);
      }
    },
    [plugins]
  );

  function onClickButtonInsertArgument(argumentName: string) {
    if (monacoEditor) {
      setPluginDirty(true);
      monacoEditor.trigger("keyboard", "type", { text: argumentName });
    }
  }

  const onClickButtonSave = React.useCallback(() => {
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

  const onClickDialogPluginButtonCancel = React.useCallback(
    async (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      let confirmed = true;
      if (pluginDirty) {
        confirmed = await confirm(
          "Are you sure you want to discard your changes?",
          {
            title: "Discard changes?",
            type: "warning",
          }
        );
      }
      if (confirmed) {
        setDialogPluginOpen(false);
        args.setGlobalKeyboardShortcutsEnabled(true);
        setPluginDirty(false);
      }
    },
    [pluginDirty]
  );

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

  const onSubmitDialogPlugin = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const plugin: ConfigPlugin = {
        code: monacoEditor?.getValue() as string,
        description: pluginDescription,
        name: pluginName,
        options: pluginOptions,
      };
      if (pluginIndex >= 0) {
        setPlugins([
          ...plugins.slice(0, pluginIndex),
          plugin,
          ...plugins.slice(pluginIndex + 1),
        ]);
      } else {
        setPlugins([...plugins, plugin]);
      }
      setPluginDirty(false);
      setDirty(true);
      setDialogPluginOpen(false);
      args.setGlobalKeyboardShortcutsEnabled(true);
    },
    [
      monacoEditor,
      pluginCode,
      pluginDescription,
      pluginIndex,
      pluginName,
      pluginOptions,
      plugins,
    ]
  );

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
            {(() =>
              plugins.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell
                          align="center"
                          sx={{ width: 50, maxWidth: 50 }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plugins.map((plugin, index) => (
                        <TableRow key={index}>
                          <TableCell>{plugin.name}</TableCell>
                          <TableCell>{plugin.description}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0}>
                              <IconButton
                                aria-label="Edit"
                                color="primary"
                                onClick={() => {
                                  onClickButtonEditPlugin(index);
                                }}
                              >
                                <EditNoteOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="Delete"
                                color="primary"
                                onClick={() => {
                                  onClickButtonDeletePlugin(index);
                                }}
                              >
                                <HighlightOffOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <></>
              ))()}
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
          onClick={onClickButtonSave}
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
        sx={{ maxHeight: "calc(100vh - 50px)" }}
      >
        <DialogTitle id="plugin-dialog-title">
          {pluginIndex >= 0
            ? `Edit Plugin: ${pluginName}`
            : "Create a New Plugin"}
        </DialogTitle>
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
              value={pluginName}
              onChange={onChangePluginName}
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
              value={pluginDescription}
              onChange={onChangePluginDescription}
            />
            <fieldset
              style={{ borderRadius: "5px", border: "1px solid lightgray" }}
            >
              <legend
                style={{
                  padding: "0px 5px",
                  color: "gray",
                  fontFamily: "roboto",
                  fontSize: "12px",
                }}
              >
                Arguments
              </legend>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                  onClick={() => {
                    onClickButtonInsertArgument("sourceItems");
                  }}
                >
                  Insert Source Items
                </Button>
                <Button
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                  onClick={() => {
                    onClickButtonInsertArgument("targetItems");
                  }}
                >
                  Insert Target Items
                </Button>
                <Button
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                  onClick={() => {
                    onClickButtonInsertArgument("options");
                  }}
                >
                  Insert Options
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddBoxOutlinedIcon />}
                  sx={{ textTransform: "none" }}
                  onClick={onClickButtonAddPluginOption}
                >
                  Add an Option
                </Button>
              </Stack>
              {(() =>
                pluginOptions.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Default Value</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pluginOptions.map((option, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={option.name}
                              onChange={(event) => {
                                onChangePluginOptionName(event, index);
                              }}
                              placeholder="Name"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={option.defaultValue}
                              onChange={(event) => {
                                onChangePluginOptionDefaultValue(event, index);
                              }}
                              placeholder="Default Value"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              aria-label="Delete"
                              color="primary"
                              onClick={() => {
                                onClickButtonDeletePluginOption(index);
                              }}
                            >
                              <HighlightOffOutlinedIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <></>
                ))()}
            </fieldset>
            <fieldset
              style={{ borderRadius: "5px", border: "1px solid lightgray" }}
            >
              <legend
                style={{
                  padding: "0px 5px",
                  color: "gray",
                  fontFamily: "roboto",
                  fontSize: "12px",
                }}
              >
                Code *
              </legend>
              <Editor
                height="calc(100vh - 400px)"
                language="javascript"
                onMount={onMountEditor}
                defaultValue=""
                theme="light"
                value={pluginCode}
                options={{
                  fontSize: 16,
                }}
                onChange={onChangePluginCode}
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
            {pluginIndex >= 0 ? "Update" : "Create"}
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
