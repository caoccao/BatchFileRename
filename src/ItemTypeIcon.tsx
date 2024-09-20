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
  HelpCenterOutlined as HelpCenterOutlinedIcon,
  TextSnippetOutlined as TextSnippetOutlinedIcon,
  TopicOutlined as TopicOutlinedIcon,
} from "@mui/icons-material";

import { ItemType } from "./lib/Protocol";

export interface Args {
  type: ItemType;
}

function ItemTypeIcon(args: Args) {
  switch (args.type) {
    case ItemType.Directory:
      return (
        <TopicOutlinedIcon fontSize="small" sx={{ color: "primary.dark" }} />
      );
    case ItemType.File:
      return (
        <TextSnippetOutlinedIcon
          fontSize="small"
          sx={{ color: "primary.light" }}
        />
      );
    default:
      return <HelpCenterOutlinedIcon fontSize="small" htmlColor="gray" />;
  }
}

export default ItemTypeIcon;
