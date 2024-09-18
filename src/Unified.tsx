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

import DescriptionIcon from "@mui/icons-material/Description";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import ItemTypeIcon from "./ItemTypeIcon";
import { Item } from "./lib/Protocol";

export interface Args {
  items: Item[];
}

function Unified(args: Args) {
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
}

export default Unified;
