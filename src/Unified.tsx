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
  Description as DescriptionIcon,
  NumbersOutlined as NumbersOutlinedIcon,
} from "@mui/icons-material";

import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Item, Notification, NotificationType } from "./lib/Protocol";
import ItemTypeIcon from "./ItemTypeIcon";

export interface Args {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
}

function Unified(args: Args) {
  const onClickScan = React.useCallback(() => {
    invoke<Item[]>("scan_items", {
      items: args.items,
      depth: -1,
      includeDirectory: true,
      extensions: [],
    })
      .then((value) => {
        args.setNotification({
          message: "",
          type: NotificationType.None,
        });
        args.setItems(value);
      })
      .catch((error) => {
        args.setNotification({
          message: `${error}`,
          type: NotificationType.Error,
        });
      });
  }, [args.items]);

  if (args.items.length > 0) {
    return (
      <React.Fragment>
        <Stack direction="row" spacing={2} sx={{ mb: "5px" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onClickScan}
            sx={{ textTransform: "none" }}
          >
            Scan
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ width: 24, maxWidth: 24 }}>
                  <NumbersOutlinedIcon />
                </TableCell>
                <TableCell align="center" sx={{ width: 24, maxWidth: 24 }}>
                  <DescriptionIcon />
                </TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Target</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {args.items.map((item, index) => (
                <TableRow key={item.sourcePath}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">
                    <ItemTypeIcon type={item.type} />
                  </TableCell>
                  <TableCell>{item.sourcePath}</TableCell>
                  <TableCell>{item.targetPath}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </React.Fragment>
    );
  } else {
    return (
      <Typography variant="h4" sx={{ textAlign: "center", mt: 5, mb: 5 }}>
        Please drag-and-drop files or folders here.
      </Typography>
    );
  }
}

export default Unified;
