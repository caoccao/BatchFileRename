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
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
} from "@mui/material";
import {
  ArrowDropDown as ArrowDropDownIcon,
  ContentCopyOutlined as ContentCopyOutlinedIcon,
  SaveOutlined as SaveOutlinedIcon,
  TerminalOutlined as TerminalOutlinedIcon,
} from "@mui/icons-material";

import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
// @ts-ignore
import { initVimMode } from "monaco-vim";

import { Config, Item, Notification, NotificationType } from "./lib/Protocol";
import { runPlugin } from "./lib/PluginRunner";

export interface Args {
  config: Config | null;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}

function TargetEditor(args: Args) {
  const [monacoEditor, setMonacoEditor] =
    React.useState<editor.IStandaloneCodeEditor | null>(null);
  const pluginMenuRef = React.useRef<HTMLDivElement>(null);
  const [pluginIndex, setPluginIndex] = React.useState(0);
  const [pluginMenuOpen, setPluginMenuOpen] = React.useState(false);
  const [vim, setVim] = React.useState<any>(null);

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

  function onClickPluginMenuDropdown(
    _event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ): void {
    setPluginIndex(index);
    setPluginMenuOpen(false);
  }

  function onClickRunPlugin() {
    const plugin = args.config?.plugins[pluginIndex];
    if (plugin && monacoEditor) {
      try {
        monacoEditor.setValue(
          runPlugin(plugin, args.items, monacoEditor.getValue())
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
        {args.config?.plugins && args.config.plugins.length > 0 ? (
          <React.Fragment>
            <ButtonGroup variant="outlined" ref={pluginMenuRef}>
              <Button
                variant="outlined"
                size="small"
                sx={{ textTransform: "none" }}
                onClick={onClickRunPlugin}
              >
                {args.config?.plugins[pluginIndex].name}
              </Button>
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
  );
}

export default TargetEditor;
