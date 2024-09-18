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

import { Recycling as RecyclingIcon } from "@mui/icons-material";
import { Box, Button, Stack, Tooltip } from "@mui/material";

import { Item } from "./lib/Protocol";

export interface Args {
  clear: () => void;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

function Tools(args: Args) {
  function onClickClear() {
    args.clear();
  }

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <Tooltip arrow title="Clear">
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
      </Stack>
    </Box>
  );
}

export default Tools;
