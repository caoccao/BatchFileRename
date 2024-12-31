/*
 *   Copyright (c) 2024-2025. caoccao.com Sam Cao
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

import React from "react";
import { Alert, Snackbar } from "@mui/material";

import { Notification, NotificationType } from "./lib/Protocol";

export interface Args {
  notification: Notification | null;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}

function NotificationBar(args: Args) {
  function onCloseSnackbar() {
    args.setNotification(null);
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={args.notification !== null}
      onClose={onCloseSnackbar}
      autoHideDuration={5000}
    >
      <Alert
        onClose={onCloseSnackbar}
        severity={(() => {
          switch (args.notification?.type) {
            case NotificationType.Error:
              return "error";
            case NotificationType.Success:
              return "success";
            default:
              return "info";
          }
        })()}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {args.notification?.message}
      </Alert>
    </Snackbar>
  );
}

export default NotificationBar;
