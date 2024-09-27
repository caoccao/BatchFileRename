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

import * as uuid from "uuid";

import React from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

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
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  AddBoxOutlined as AddBoxOutlinedIcon,
  AddchartOutlined as AddchartOutlinedIcon,
  AddCircleOutlineOutlined as AddCircleOutlineOutlinedIcon,
  DisabledByDefaultOutlined as DisabledByDefaultOutlinedIcon,
  DragIndicatorOutlined as DragIndicatorOutlinedIcon,
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
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}

function Settings(args: Args) {
  const [builtInPlugins, setBuiltInPlugins] = React.useState<ConfigPlugin[]>(
    []
  );
  const [builtInPluginsMenuAnchorEl, setBuiltInPluginsMenuAnchorEl] =
    React.useState<HTMLElement | null>(null);
  const [depth, setDepth] = React.useState(-1);
  const [dirty, setDirty] = React.useState(false);
  const [dialogPluginOpen, setDialogPluginOpen] = React.useState(false);
  const [extensionText, setExtensionText] = React.useState("");
  const [filterByExtensions, setFilterByExtensions] = React.useState(true);
  const [includeDirectories, setIncludeDirectories] = React.useState(false);
  const [monacoEditor, setMonacoEditor] =
    React.useState<editor.IStandaloneCodeEditor | null>(null);
  const [plugins, setPlugins] = React.useState<ConfigPlugin[]>([]);
  const [pluginCode, setPluginCode] = React.useState("");
  const [pluginCodeErrorMessage, setPluginCodeErrorMessage] =
    React.useState("");
  const [pluginDescription, setPluginDescription] = React.useState("");
  const [pluginDirty, setPluginDirty] = React.useState(false);
  const [pluginIndex, setPluginIndex] = React.useState(-1);
  const [pluginName, setPluginName] = React.useState("");
  const [pluginOptions, setPluginOptions] = React.useState<
    ConfigPluginOption[]
  >([]);
  const pluginTableRef = React.useRef<HTMLTableElement>(null);
  const [pluginTableRowHeight, setPluginTableRowHeight] = React.useState<
    number | null
  >(null);
  const [pluginTableRowPosition, setPluginTableRowPosition] = React.useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const [vim, setVim] = React.useState<any>(null);

  const builtInPluginsNotInConfig = React.useMemo(() => {
    const pluginIdSet = new Set(plugins.map((plugin) => plugin.id));
    return builtInPlugins.filter(
      (builtInPlugin) => !pluginIdSet.has(builtInPlugin.id)
    );
  }, [plugins, builtInPlugins]);

  function onCloseBuiltInPluginsMenu() {
    setBuiltInPluginsMenuAnchorEl(null);
  }

  const onBlurExtensions = React.useCallback(
    (_event: React.FocusEvent<HTMLInputElement>) => {
      setConfig(
        depth,
        extensionText,
        filterByExtensions,
        includeDirectories,
        plugins
      );
    },
    [depth, extensionText, filterByExtensions, includeDirectories, plugins]
  );

  const onChangeDepth = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newDepth = Number(event.target.value);
      setDepth(newDepth);
      setConfig(
        newDepth,
        extensionText,
        filterByExtensions,
        includeDirectories,
        plugins
      );
    },
    [depth, extensionText, filterByExtensions, includeDirectories, plugins]
  );

  function onChangeExtensionText(e: React.ChangeEvent<HTMLInputElement>) {
    setDirty(true);
    setExtensionText(e.target.value);
  }

  const onChangeFilterByExtensions = React.useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>) => {
      const newFilterByExtensions = !filterByExtensions;
      setFilterByExtensions(newFilterByExtensions);
      setConfig(
        depth,
        extensionText,
        newFilterByExtensions,
        includeDirectories,
        plugins
      );
    },
    [depth, extensionText, filterByExtensions, includeDirectories, plugins]
  );

  const onChangeIncludeDirectories = React.useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>) => {
      const newIncludeDirectories = !includeDirectories;
      setIncludeDirectories(newIncludeDirectories);
      setConfig(
        depth,
        extensionText,
        filterByExtensions,
        newIncludeDirectories,
        plugins
      );
    },
    [depth, extensionText, filterByExtensions, includeDirectories, plugins]
  );

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

  function onClickButtonAddABuiltInPlugin(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    setBuiltInPluginsMenuAnchorEl(event.currentTarget);
  }

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
        const newPlugins = plugins.filter((_, i) => i !== index);
        setPlugins(newPlugins);
        setConfig(
          depth,
          extensionText,
          filterByExtensions,
          includeDirectories,
          newPlugins
        );
      }
    },
    [depth, extensionText, filterByExtensions, includeDirectories, plugins]
  );

  const onClickButtonDeletePluginOption = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < pluginOptions.length) {
        setPluginDirty(true);
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
        setPluginCodeErrorMessage("");
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

  const onClickMenuItemAddABuiltInPlugin = React.useCallback(
    (plugin: ConfigPlugin) => {
      setBuiltInPluginsMenuAnchorEl(null);
      const newPlugins = [...plugins, plugin];
      setPlugins(newPlugins);
      setConfig(
        depth,
        extensionText,
        filterByExtensions,
        includeDirectories,
        newPlugins
      );
    },
    [depth, extensionText, filterByExtensions, includeDirectories, plugins]
  );

  const onDragPlugin = React.useCallback(
    (_event: DraggableEvent, data: DraggableData, index: number) => {
      const position = { index, x: data.x, y: data.y };
      setPluginTableRowPosition(position);
    },
    [plugins]
  );

  const onDragStartPlugin = React.useCallback(
    (_index: number) => {
      setPluginTableRowPosition(null);
      const rowElements = pluginTableRef.current?.children[1].children;
      if (rowElements && rowElements.length > 0) {
        const height =
          [...rowElements]
            .map((node) => node.getBoundingClientRect().height)
            .reduce((a, b) => a + b, 0) / rowElements.length;
        setPluginTableRowHeight(height);
      } else {
        setPluginTableRowHeight(null);
      }
    },
    [plugins]
  );

  const onDragStopPlugin = React.useCallback(
    (index: number) => {
      if (pluginTableRowPosition) {
        if (index === pluginTableRowPosition.index) {
          if (
            pluginTableRowHeight !== null &&
            index >= 0 &&
            index < plugins.length
          ) {
            const rowElements = pluginTableRef.current?.children[1].children;
            if (rowElements && rowElements.length > 0) {
              const newIndex = Math.min(
                Math.max(
                  0,
                  Math.round(pluginTableRowPosition.y / pluginTableRowHeight) +
                    index
                ),
                plugins.length - 1
              );
              [...rowElements].forEach((node) => {
                (node as HTMLTableRowElement).style.transform =
                  "translate(0px, 0px)";
              });
              if (newIndex !== index) {
                const newPlugins = [...plugins];
                newPlugins[index] = plugins[newIndex];
                newPlugins[newIndex] = plugins[index];
                setPlugins(newPlugins);
                setConfig(
                  depth,
                  extensionText,
                  filterByExtensions,
                  includeDirectories,
                  newPlugins
                );
              }
            }
          }
        } else {
          console.error(
            `Invalid index ${index} and ${pluginTableRowPosition.index}`
          );
        }
      }
      setPluginTableRowPosition(null);
      setPluginTableRowHeight(null);
    },
    [
      depth,
      extensionText,
      filterByExtensions,
      includeDirectories,
      plugins,
      pluginTableRowPosition,
      pluginTableRowHeight,
    ]
  );

  function onMountEditor(
    monacoEditor: editor.IStandaloneCodeEditor,
    _monaco: Monaco
  ) {
    setMonacoEditor(monacoEditor);
  }

  const onSubmitDialogPlugin = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const code = monacoEditor?.getValue().trim();
      if (code && code !== "") {
        const plugin: ConfigPlugin = {
          code,
          description: pluginDescription,
          id: uuid.v4(),
          name: pluginName,
          options: pluginOptions,
        };
        const newPlugins =
          pluginIndex >= 0
            ? [
                ...plugins.slice(0, pluginIndex),
                plugin,
                ...plugins.slice(pluginIndex + 1),
              ]
            : [...plugins, plugin];
        setPlugins(newPlugins);
        setPluginDirty(false);
        setPluginCodeErrorMessage("");
        setDialogPluginOpen(false);
        setConfig(
          depth,
          extensionText,
          filterByExtensions,
          includeDirectories,
          newPlugins
        );
        args.setGlobalKeyboardShortcutsEnabled(true);
      } else {
        setPluginCodeErrorMessage("Please fill in the code.");
      }
    },
    [
      depth,
      extensionText,
      filterByExtensions,
      includeDirectories,
      monacoEditor,
      plugins,
      pluginCode,
      pluginDescription,
      pluginIndex,
      pluginName,
      pluginOptions,
    ]
  );

  function setConfig(
    depth: number,
    extensionText: string,
    filterByExtensions: boolean,
    includeDirectories: boolean,
    plugins: ConfigPlugin[]
  ) {
    const extensions = extensionText
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
    const config = {
      depth,
      extensions,
      filterByExtensions,
      includeDirectories,
      plugins,
    };
    args.setConfig(config);
    setDirty(true);
  }

  React.useEffect(() => {
    if (args.config) {
      setDepth(args.config.depth);
      setExtensionText(args.config.extensions.join(", "));
      setIncludeDirectories(args.config.includeDirectories);
      setPlugins(args.config.plugins);
    }
  }, [args.config]);

  React.useEffect(() => {
    invoke<ConfigPlugin[]>("get_built_in_plugins")
      .then((value) => {
        setBuiltInPlugins(value);
      })
      .catch((error) => {
        args.setNotification({
          message: `${error}`,
          type: NotificationType.Error,
        });
      });
  }, []);

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
            <Stack spacing={2}>
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
                  Default
                </legend>
                <Tooltip
                  arrow
                  title="Include the directories in the source items."
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeDirectories}
                        onChange={onChangeIncludeDirectories}
                      />
                    }
                    label="Include Directories"
                  />
                </Tooltip>
                <Tooltip
                  arrow
                  title="Scan the directories recursively by the given depth. -1 means no limit."
                >
                  <TextField
                    type="number"
                    label="Depth"
                    variant="outlined"
                    value={depth}
                    onChange={onChangeDepth}
                    size="small"
                    sx={{ width: "70px", mr: "20px" }}
                  />
                </Tooltip>
                <Tooltip arrow title={`Filter by ${extensionText}.`}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filterByExtensions}
                        onChange={onChangeFilterByExtensions}
                      />
                    }
                    label="Filter by Extensions"
                  />
                </Tooltip>
              </fieldset>
              <TextField
                label="Extensions"
                fullWidth
                size="small"
                value={extensionText}
                onChange={onChangeExtensionText}
                onBlur={onBlurExtensions}
              />
            </Stack>
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
                  <Table size="small" ref={pluginTableRef}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell
                          align="center"
                          sx={{ width: 80, maxWidth: 80 }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plugins.map((plugin, index) => (
                        <Draggable
                          axis="y"
                          key={plugin.id}
                          scale={1}
                          onStart={() => onDragStartPlugin(index)}
                          onDrag={(event, data) =>
                            onDragPlugin(event, data, index)
                          }
                          onStop={() => onDragStopPlugin(index)}
                        >
                          <TableRow key={plugin.id}>
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
                                <IconButton aria-label="Move" color="primary">
                                  <DragIndicatorOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        </Draggable>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <></>
              ))()}
          </CardContent>
          <CardActions disableSpacing sx={{ padding: "0px 15px 15px 15px" }}>
            <Stack direction="row" spacing={2}>
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
              {builtInPluginsNotInConfig.length > 0 ? (
                <React.Fragment>
                  <Button
                    variant="outlined"
                    startIcon={<AddchartOutlinedIcon />}
                    size="small"
                    fullWidth={false}
                    id="button-add-a-built-in-plugin"
                    aria-controls={
                      builtInPluginsMenuAnchorEl != null
                        ? "menu-add-a-built-in-plugin"
                        : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={
                      builtInPluginsMenuAnchorEl != null ? "true" : undefined
                    }
                    onClick={onClickButtonAddABuiltInPlugin}
                    sx={{ textTransform: "none" }}
                  >
                    Add a Built-in Plugin
                  </Button>
                  <Menu
                    id="menu-add-a-built-in-plugin"
                    anchorEl={builtInPluginsMenuAnchorEl}
                    open={builtInPluginsMenuAnchorEl != null}
                    onClose={onCloseBuiltInPluginsMenu}
                    MenuListProps={{
                      "aria-labelledby": "button-add-a-built-in-plugin",
                    }}
                  >
                    {builtInPluginsNotInConfig.map((plugin) => (
                      <MenuItem
                        key={plugin.id}
                        onClick={() => onClickMenuItemAddABuiltInPlugin(plugin)}
                      >
                        {plugin.name}
                      </MenuItem>
                    ))}
                  </Menu>
                </React.Fragment>
              ) : (
                <></>
              )}
            </Stack>
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
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Tooltip arrow title="Insert $sourceItems">
                    <Button
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                      onClick={() => {
                        onClickButtonInsertArgument("$sourceItems");
                      }}
                    >
                      $sourceItems
                    </Button>
                  </Tooltip>
                  <Tooltip arrow title="Insert $targetItems">
                    <Button
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                      onClick={() => {
                        onClickButtonInsertArgument("$targetItems");
                      }}
                    >
                      $targetItems
                    </Button>
                  </Tooltip>
                  <Tooltip arrow title="Insert $options">
                    <Button
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                      onClick={() => {
                        onClickButtonInsertArgument("$options");
                      }}
                    >
                      $options
                    </Button>
                  </Tooltip>
                  <Tooltip arrow title="Insert $modules">
                    <Button
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                      onClick={() => {
                        onClickButtonInsertArgument("$modules");
                      }}
                    >
                      $modules
                    </Button>
                  </Tooltip>
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
                    <TableContainer component={Paper}>
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
                                    onChangePluginOptionDefaultValue(
                                      event,
                                      index
                                    );
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
                    </TableContainer>
                  ) : (
                    <></>
                  ))()}
              </Stack>
            </fieldset>
            <fieldset
              style={{ borderRadius: "5px", border: "1px solid lightgray" }}
            >
              <legend
                style={{
                  padding: "0px 5px",
                  color: pluginCodeErrorMessage === "" ? "gray" : "red",
                  fontFamily: "roboto",
                  fontSize: "12px",
                }}
              >
                {pluginCodeErrorMessage === ""
                  ? "Code *"
                  : `Code * (${pluginCodeErrorMessage})`}
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
