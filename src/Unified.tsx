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

import {
  Description as DescriptionIcon,
  NumbersOutlined as NumbersOutlinedIcon,
} from "@mui/icons-material";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Item } from "./lib/Protocol";
import ItemTypeIcon from "./ItemTypeIcon";

export interface Args {
  items: Item[];
}

function Unified(args: Args) {
  if (args.items.length > 0) {
    return (
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
