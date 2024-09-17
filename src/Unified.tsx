import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export interface Args {
  sourceFiles: string[];
  targetFiles: string[];
}

function Unified(args: Args) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Source</TableCell>
            <TableCell>Target</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {args.sourceFiles.map((sourceFile, index) => (
            <TableRow key={index}>
              <TableCell>{sourceFile}</TableCell>
              <TableCell>{args.targetFiles[index]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Unified;
