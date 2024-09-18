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

import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import type { Event, UnlistenFn } from "@tauri-apps/api/event";
import type { FileDropEvent } from "@tauri-apps/api/window";

import React from "react";
import { Box, Tab, Tabs } from "@mui/material";

import { Item, ItemType, Notification, NotificationType } from "./lib/Protocol";

import Footer from "./Footer";
import SourceEditor from "./SourceEditor";
import TargetEditor from "./TargetEditor";
import Tools from "./Tools";
import Unified from "./Unified";

function App() {
  const [notification, setNotification] = React.useState<Notification>({
    message: "",
    type: NotificationType.None,
  });
  const [items, setItems] = React.useState<Item[]>([]);

  const [tabIndex, setTabIndex] = React.useState(0);

  const onChangeTabIndex = (
    _event: React.SyntheticEvent,
    newTabIndex: number
  ) => {
    setTabIndex(newTabIndex);
  };

  React.useEffect(() => {
    let cancelFileDrop: UnlistenFn | null = null;
    appWindow
      .onFileDropEvent((event: Event<FileDropEvent>) => {
        if (event.payload.type === "drop") {
          const paths = event.payload.paths;
          const newItems = paths.map((path) => ({
            sourcePath: path,
            targetPath: path,
            type: ItemType.Unknown,
          }));
          clearNotification();
          setItems(newItems);
          invoke<Item[]>("scan_items", { items: newItems })
            .then((value) => {
              setItems(value);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      })
      .then((value) => {
        cancelFileDrop = value;
      });
    return () => {
      if (cancelFileDrop) {
        cancelFileDrop();
      }
    };
  }, []);

  function clear() {
    clearNotification();
    setItems([]);
    setTabIndex(0);
  }

  function clearNotification() {
    setNotification({
      message: "",
      type: NotificationType.None,
    });
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Tools
        clear={clear}
        items={items}
        notification={notification}
        setItems={setItems}
      />
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: "5px" }}>
        <Tabs
          value={tabIndex}
          onChange={onChangeTabIndex}
          aria-label="Batch File Rename"
        >
          <Tab
            label="Unified"
            id="tab-id-unified"
            aria-controls="tab-control-unified"
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
        id="tab-id-unified"
        aria-labelledby="tab-control-unified"
        hidden={tabIndex !== 0}
      >
        <Unified items={items} />
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
        Settings
      </div>
      <Footer />
    </Box>
  );
}

export default App;
