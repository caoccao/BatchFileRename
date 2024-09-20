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

import {
  Publish as PublishIcon,
  Recycling as RecyclingIcon,
} from "@mui/icons-material";
import { Box, Button, Stack, Tooltip, Typography } from "@mui/material";

import { Item, Notification, NotificationType } from "./lib/Protocol";

export interface Args {
  clear: () => void;
  items: Item[];
  notification: Notification;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
}

function NotificationBox(args: { notification: Notification }) {
  switch (args.notification.type) {
    case NotificationType.Error:
      return (
        <Typography variant="body1" color="error">
          {args.notification.message}
        </Typography>
      );
    case NotificationType.Info:
      return (
        <Typography variant="body1" color="info">
          {args.notification.message}
        </Typography>
      );
    default:
      return <></>;
  }
}

function Tools(args: Args) {
  const onClickClear = React.useCallback(() => {
    args.clear();
  }, [args.items, args.notification]);

  const onClickRename = React.useCallback(() => {
    invoke<number>("rename_items", {
      items: args.items,
    })
      .then((value) => {
        args.setNotification({
          message: `Renamed ${value} item(s) successfully`,
          type: NotificationType.Info,
        });
      })
      .catch((error) => {
        args.setNotification({
          message: `${error}`,
          type: NotificationType.Error,
        });
      });
  }, [args.items, args.notification]);

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <Tooltip arrow title="Rename (F2)">
          <Button
            variant="outlined"
            startIcon={<PublishIcon />}
            onClick={onClickRename}
            size="small"
            disabled={args.items.length === 0}
            sx={{ textTransform: "none" }}
          >
            Rename
          </Button>
        </Tooltip>
        <Tooltip arrow title="Clear (F8)">
          <Button
            variant="outlined"
            startIcon={<RecyclingIcon />}
            onClick={onClickClear}
            size="small"
            disabled={args.items.length === 0}
            sx={{ textTransform: "none" }}
          >
            Clear
          </Button>
        </Tooltip>
        <NotificationBox notification={args.notification} />
      </Stack>
    </Box>
  );
}

export default Tools;
