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
  DocumentScannerOutlined as DocumentScannerOutlinedIcon,
  NumbersOutlined as NumbersOutlinedIcon,
} from "@mui/icons-material";

import {
  Button,
  Checkbox,
  FormControlLabel,
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
  Typography,
} from "@mui/material";

import { Config, Item, Notification, NotificationType } from "./lib/Protocol";
import ItemTypeIcon from "./ItemTypeIcon";

export interface Args {
  config: Config | null;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
}

function Unified(args: Args) {
  const [depth, setDepth] = React.useState(-1);
  const [filterByExtensions, setFilterByExtensions] = React.useState(true);
  const [includeDirectory, setIncludeDirectory] = React.useState(true);

  const onClickScan = React.useCallback(() => {
    invoke<Item[]>("scan_items", {
      items: args.items,
      depth,
      includeDirectory,
      extensions:
        filterByExtensions && args.config ? args.config.extensions : [],
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
  }, [args.items, depth, includeDirectory, filterByExtensions, args.config]);

  function onChangeDepth(event: React.ChangeEvent<HTMLInputElement>) {
    setDepth(Number(event.target.value));
  }

  function onChangeFilterByExtensions(
    _event: React.ChangeEvent<HTMLInputElement>
  ) {
    setFilterByExtensions(!filterByExtensions);
  }

  function onChangeIncludeDirectory(
    _event: React.ChangeEvent<HTMLInputElement>
  ) {
    setIncludeDirectory(!includeDirectory);
  }

  if (args.items.length > 0) {
    return (
      <React.Fragment>
        <Stack direction="row" spacing={2} sx={{ mt: "10px", mb: "5px" }}>
          <Button
            variant="outlined"
            startIcon={<DocumentScannerOutlinedIcon />}
            size="small"
            onClick={onClickScan}
            sx={{ textTransform: "none" }}
          >
            Scan
          </Button>
          <Tooltip arrow title="Scan the directories.">
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeDirectory}
                  onChange={onChangeIncludeDirectory}
                />
              }
              label="Include Directory"
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
              sx={{ width: "70px" }}
            />
          </Tooltip>
          <Tooltip
            arrow
            title={`Filter by ${args.config?.extensions.join(", ")}.`}
          >
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
