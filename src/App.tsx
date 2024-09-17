import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import type { Event, UnlistenFn } from "@tauri-apps/api/event";
import type { FileDropEvent } from "@tauri-apps/api/window";

import React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

function App() {
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
          console.log(event.payload.paths);
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

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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
            sx={{ textTransform: "none" }}
          />
          <Tab
            label="Target"
            id="tab-id-target"
            aria-controls="tab-control-target"
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
        Unified View
      </div>
      <div
        id="tab-id-source"
        aria-labelledby="tab-control-source"
        hidden={tabIndex !== 1}
      >
        Source File List
      </div>
      <div
        id="tab-id-target"
        aria-labelledby="tab-control-target"
        hidden={tabIndex !== 2}
      >
        Target File List
      </div>
      <div
        id="tab-id-settings"
        aria-labelledby="tab-control-settings"
        hidden={tabIndex !== 3}
      >
        Settings
      </div>
    </Box>
  );
}

export default App;
