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

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { getCurrentWindow, type DragDropEvent } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import type { Event, UnlistenFn } from "@tauri-apps/api/event";

import React from "react";
import { Box, Tab, Tabs } from "@mui/material";

import {
  Config,
  Item,
  ItemType,
  Notification,
  NotificationType,
} from "./lib/Protocol";

import Dashboard from "./Dashboard";
import Footer from "./Footer";
import NotificationBar from "./NotificationBar";
import Settings from "./Settings";
import SourceEditor from "./SourceEditor";
import TargetEditor from "./TargetEditor";
import Tools from "./Tools";

const TAB_SIZE = 4;

function App() {
  const [config, setConfig] = React.useState<Config | null>(null);
  const [items, setItems] = React.useState<Item[]>([]);
  const [globalKeyboardShortcutsEnabled, setGlobalKeyboardShortcutsEnabled] =
    React.useState(true);
  const [notification, setNotification] = React.useState<Notification | null>(
    null
  );
  const [tabIndex, setTabIndex] = React.useState(0);

  function clear() {
    setItems([]);
    setTabIndex(0);
  }

  const handleClear = React.useCallback(() => {
    clear();
  }, [items, tabIndex]);

  const handleGlobalKeyboardShortcuts = React.useCallback(
    (event: KeyboardEvent) => {
      if (globalKeyboardShortcutsEnabled) {
        if (
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey
        ) {
          switch (event.key) {
            case "F2":
              event.preventDefault();
              handleRename();
              break;
            case "F8":
              event.preventDefault();
              handleClear();
              break;
            default:
              break;
          }
        } else if (
          event.ctrlKey &&
          !event.altKey &&
          !event.metaKey &&
          !event.shiftKey
        ) {
          switch (event.key) {
            case "1":
            case "4":
              event.preventDefault();
              setTabIndex(Number(event.key) - 1);
              break;
            case "2":
            case "3":
              event.preventDefault();
              if (items.length > 0) {
                setTabIndex(Number(event.key) - 1);
              }
              break;
            case "Tab":
              let index = 0;
              if (items.length > 0) {
                index = tabIndex + 1;
              } else {
                index = tabIndex == 0 ? 3 : 0;
              }
              index = index % TAB_SIZE;
              setTabIndex(index);
              break;
          }
        } else if (
          event.ctrlKey &&
          event.shiftKey &&
          !event.altKey &&
          !event.metaKey
        ) {
          switch (event.key) {
            case "Tab":
              let index = 0;
              if (items.length > 0) {
                index = tabIndex - 1;
              } else {
                index = tabIndex == 0 ? 3 : 0;
              }
              if (index < 0) {
                index += TAB_SIZE;
              }
              setTabIndex(index);
              break;
          }
        }
      }
    },
    [items, globalKeyboardShortcutsEnabled, tabIndex]
  );

  const handleRename = React.useCallback(() => {
    invoke<number>("rename_items", { items })
      .then((value) => {
        setNotification({
          message: `Renamed ${value} item(s) successfully`,
          type: NotificationType.Success,
        });
      })
      .catch((error) => {
        setNotification({
          message: `${error}`,
          type: NotificationType.Error,
        });
      });
  }, [items, notification]);

  const onChangeTabIndex = (
    _event: React.SyntheticEvent,
    newTabIndex: number
  ) => {
    setTabIndex(newTabIndex);
  };

  React.useEffect(() => {
    let cancelFileDrop: UnlistenFn | null = null;
    getCurrentWindow()
      .onDragDropEvent((event: Event<DragDropEvent>) => {
        if (event.payload.type === "drop") {
          const paths = event.payload.paths;
          const newItems = paths.map((path) => ({
            sourcePath: path,
            targetPath: path,
            type: ItemType.Unknown,
          }));
          setItems(newItems);
          invoke<Item[]>("scan_items", {
            items: newItems,
            depth: 0,
            includeDirectory: true,
            extensions: [],
          })
            .then((value) => {
              setItems(value);
            })
            .catch((error) => {
              setNotification({
                message: `${error}`,
                type: NotificationType.Error,
              });
            });
        }
      })
      .then((value) => {
        cancelFileDrop = value;
      });
    if (config === null) {
      invoke<Config>("get_config")
        .then((result) => {
          setConfig(result);
        })
        .catch((error) => {
          setNotification({
            message: `${error}`,
            type: NotificationType.Error,
          });
        });
    }
    document.addEventListener("keydown", handleGlobalKeyboardShortcuts);
    return () => {
      if (cancelFileDrop) {
        cancelFileDrop();
      }
      document.removeEventListener("keydown", handleGlobalKeyboardShortcuts);
    };
  }, [items, config, globalKeyboardShortcutsEnabled, notification, tabIndex]);

  return (
    <Box sx={{ width: "100%" }}>
      <Tools
        clear={clear}
        items={items}
        setItems={setItems}
        setNotification={setNotification}
      />
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: "5px" }}>
        <Tabs
          value={tabIndex}
          onChange={onChangeTabIndex}
          aria-label="Batch File Rename"
        >
          <Tab
            label="Dashboard"
            id="tab-id-dashboard"
            aria-controls="tab-control-dashboard"
            sx={{ textTransform: "none" }}
          />
          <Tab
            label="Source"
            id="tab-id-source"
            aria-controls="tab-control-source"
            disabled={items.length === 0}
            sx={{ textTransform: "none" }}
          />
          <Tab
            label="Target"
            id="tab-id-target"
            aria-controls="tab-control-target"
            disabled={items.length === 0}
            sx={{ textTransform: "none" }}
          />
          <Tab
            label="Settings"
            id="tab-id-settings"
            aria-controls="tab-control-settings"
            sx={{ textTransform: "none" }}
          />
        </Tabs>
      </Box>
      <div
        id="tab-id-dashboard"
        aria-labelledby="tab-control-dashboard"
        hidden={tabIndex !== 0}
      >
        <Dashboard
          config={config}
          items={items}
          setItems={setItems}
          setNotification={setNotification}
        />
      </div>
      <div
        id="tab-id-source"
        aria-labelledby="tab-control-source"
        hidden={tabIndex !== 1}
      >
        <SourceEditor items={items} />
      </div>
      <div
        id="tab-id-target"
        aria-labelledby="tab-control-target"
        hidden={tabIndex !== 2}
      >
        <TargetEditor
          config={config}
          items={items}
          setItems={setItems}
          setNotification={setNotification}
        />
      </div>
      <div
        id="tab-id-settings"
        aria-labelledby="tab-control-settings"
        hidden={tabIndex !== 3}
      >
        <Settings
          config={config}
          setConfig={setConfig}
          setGlobalKeyboardShortcutsEnabled={setGlobalKeyboardShortcutsEnabled}
          setNotification={setNotification}
        />
      </div>
      <Footer />
      <NotificationBar
        notification={notification}
        setNotification={setNotification}
      />
    </Box>
  );
}

export default App;
