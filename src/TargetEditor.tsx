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

import { writeText } from "@tauri-apps/plugin-clipboard-manager";

import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowDropDown as ArrowDropDownIcon,
  ContentCopyOutlined as ContentCopyOutlinedIcon,
  DisabledByDefaultOutlined as DisabledByDefaultOutlinedIcon,
  SaveOutlined as SaveOutlinedIcon,
  SlideshowOutlined as SlideshowOutlinedIcon,
  TerminalOutlined as TerminalOutlinedIcon,
} from "@mui/icons-material";

import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
// @ts-ignore
import { initVimMode } from "monaco-vim";

import {
  Config,
  ConfigPlugin,
  Item,
  Notification,
  NotificationType,
} from "./lib/Protocol";
import { runPlugin } from "./lib/PluginRunner";

export interface Args {
  config: Config | null;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}

interface CustomOptionArgs {
  dialogPluginOptionsOpen: boolean;
  items: Item[];
  monacoEditor: editor.IStandaloneCodeEditor | null;
  onClickSave: () => void;
  plugin: ConfigPlugin | null;
  setDialogPluginOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}

function CustomOption(args: CustomOptionArgs) {
  const [options, setOptions] = React.useState<Record<string, string>>({});

  const onChangePluginOption = React.useCallback(
    (
      name: string,
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setOptions({ ...options, [name]: event.target.value });
    },
    [args.plugin, options]
  );

  function onClickDialogPluginOptionsButtonCancel() {
    args.setDialogPluginOptionsOpen(false);
  }

  const onSubmitDialogPluginOptions = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (args.monacoEditor && args.plugin) {
        try {
          args.monacoEditor.setValue(
            runPlugin(
              args.plugin,
              options,
              args.items,
              args.monacoEditor.getValue()
            )
          );
          args.onClickSave();
        } catch (error) {
          args.setNotification({
            message: `${error}`,
            type: NotificationType.Error,
          });
        }
      }
      args.setDialogPluginOptionsOpen(false);
    },
    [args.monacoEditor, args.items, args.plugin, options]
  );

  React.useEffect(() => {
    if (args.plugin) {
      const newOptions: Record<string, string> = {};
      args.plugin.options.forEach((option) => {
        newOptions[option.name] = option.defaultValue;
      });
      setOptions(newOptions);
    }
  }, [args.plugin]);

  return (
    <Dialog
      open={args.dialogPluginOptionsOpen}
      aria-labelledby="plugin-option-dialog-title"
      aria-describedby="plugin-option-dialog-description"
      fullWidth={true}
      maxWidth="xl"
      onClose={onClickDialogPluginOptionsButtonCancel}
      PaperProps={{
        component: "form",
        onSubmit: onSubmitDialogPluginOptions,
      }}
      sx={{ maxHeight: "80vh" }}
    >
      <DialogTitle id="plugin-option-dialog-title">
        {"Run Plugin: " + args.plugin?.name}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: "10px" }}>
          <Typography>{args.plugin?.description}</Typography>
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
              Options
            </legend>
            {(() =>
              Object.keys(options).length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(options).map(([name, value]) => (
                        <TableRow key={name}>
                          <TableCell>
                            <Typography>{name}</Typography>
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={value}
                              onChange={(event) => {
                                onChangePluginOption(name, event);
                              }}
                              placeholder="Default Value"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <></>
              ))()}
          </fieldset>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          variant="outlined"
          startIcon={<SlideshowOutlinedIcon />}
          sx={{ textTransform: "none" }}
        >
          Run
        </Button>
        <Button
          variant="outlined"
          startIcon={<DisabledByDefaultOutlinedIcon />}
          onClick={onClickDialogPluginOptionsButtonCancel}
          color="error"
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TargetEditor(args: Args) {
  const [dialogPluginOptionsOpen, setDialogPluginOptionsOpen] =
    React.useState(false);
  const [monacoEditor, setMonacoEditor] =
    React.useState<editor.IStandaloneCodeEditor | null>(null);
  const pluginMenuRef = React.useRef<HTMLDivElement>(null);
  const [pluginIndex, setPluginIndex] = React.useState(0);
  const [pluginMenuOpen, setPluginMenuOpen] = React.useState(false);
  const [vim, setVim] = React.useState<any>(null);

  const runPluginWithOptions = React.useCallback(
    (plugin: ConfigPlugin, enableCustomOptions: boolean) => {
      if (monacoEditor) {
        if (enableCustomOptions && plugin.options.length > 0) {
          setDialogPluginOptionsOpen(true);
        } else {
          const options: Record<string, string> = {};
          plugin.options.forEach((option) => {
            options[option.name] = option.defaultValue;
          });
          try {
            monacoEditor.setValue(
              runPlugin(plugin, options, args.items, monacoEditor.getValue())
            );
            onClickSave();
          } catch (error) {
            args.setNotification({
              message: `${error}`,
              type: NotificationType.Error,
            });
          }
        }
      }
    },
    [args.items, monacoEditor]
  );

  function onClickAwayPluginMenu(event: MouseEvent | TouchEvent) {
    if (
      pluginMenuRef.current &&
      pluginMenuRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setPluginMenuOpen(false);
  }

  function onClickCopy() {
    if (monacoEditor) {
      writeText(monacoEditor.getValue());
    }
  }

  function onClickPluginMenu(
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setPluginMenuOpen(!pluginMenuOpen);
  }

  const onClickPluginMenuDropdown = React.useCallback(
    (event: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
      setPluginIndex(index);
      setPluginMenuOpen(false);
      const plugin = args.config?.plugins[index];
      if (plugin) {
        runPluginWithOptions(plugin, event.ctrlKey);
      }
    },
    [args.config, args.items, monacoEditor, pluginIndex]
  );

  const onClickRunPlugin = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const plugin = args.config?.plugins[pluginIndex];
      if (plugin) {
        runPluginWithOptions(plugin, event.ctrlKey);
      }
    },
    [args.config, args.items, monacoEditor, pluginIndex]
  );

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
      setVim(
        initVimMode(monacoEditor, document.querySelector(`.status-node-target`))
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

  return (
    <React.Fragment>
      <Box sx={{ width: "100%" }}>
        <Stack direction="row" spacing={2} sx={{ mb: "5px" }}>
          <ButtonGroup variant="outlined">
            <Tooltip arrow title="Copy">
              <Button variant="outlined" size="small" onClick={onClickCopy}>
                <ContentCopyOutlinedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip arrow title="Save">
              <Button variant="outlined" size="small" onClick={onClickSave}>
                <SaveOutlinedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Button
              variant={vim ? "contained" : "outlined"}
              startIcon={<TerminalOutlinedIcon />}
              size="small"
              onClick={onClickVimMode}
              sx={{ textTransform: "none" }}
            >
              Vim Mode
            </Button>
          </ButtonGroup>
          {args.config?.plugins && args.config.plugins.length > 0 ? (
            <React.Fragment>
              <ButtonGroup variant="outlined" ref={pluginMenuRef}>
                <Tooltip
                  arrow
                  title="Click to run plugin with default options. Ctrl + Click to run plugin with custom options."
                >
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: "none" }}
                    onClick={onClickRunPlugin}
                  >
                    {args.config?.plugins[pluginIndex].name}
                  </Button>
                </Tooltip>
                <Button
                  size="small"
                  aria-controls={pluginMenuOpen ? "plugin-menu" : undefined}
                  aria-expanded={pluginMenuOpen ? "true" : undefined}
                  aria-label="select merge strategy"
                  aria-haspopup="menu"
                  onClick={onClickPluginMenu}
                >
                  <ArrowDropDownIcon />
                </Button>
              </ButtonGroup>
              <Popper
                sx={{ zIndex: 1 }}
                open={pluginMenuOpen}
                anchorEl={pluginMenuRef.current}
                role={undefined}
                transition
                disablePortal
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === "bottom" ? "center top" : "center bottom",
                    }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={onClickAwayPluginMenu}>
                        <MenuList id="plugin-menu" autoFocusItem>
                          {args.config?.plugins.map((plugin, index) => (
                            <MenuItem
                              key={plugin.name}
                              selected={index === pluginIndex}
                              dense={true}
                              onClick={(event) =>
                                onClickPluginMenuDropdown(event, index)
                              }
                            >
                              {plugin.name}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </React.Fragment>
          ) : null}
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
      <CustomOption
        dialogPluginOptionsOpen={dialogPluginOptionsOpen}
        items={args.items}
        monacoEditor={monacoEditor}
        onClickSave={onClickSave}
        plugin={args.config?.plugins[pluginIndex] || null}
        setDialogPluginOptionsOpen={setDialogPluginOptionsOpen}
        setNotification={args.setNotification}
      />
    </React.Fragment>
  );
}

export default TargetEditor;
