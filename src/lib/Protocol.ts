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

export interface Config {
  extensions: string[];
  plugins: ConfigPlugin[];
}

export interface ConfigPlugin {
  code: string;
  description: string;
  options: ConfigPluginOption[];
  name: string;
}

export interface ConfigPluginOption {
  defaultValue: string;
  name: string;
}

export interface Item {
  sourcePath: string;
  targetPath: string;
  type: ItemType;
}

export enum ItemType {
  File = "File",
  Directory = "Directory",
  Unknown = "Unknown",
}

export interface Notification {
  message: string;
  type: NotificationType;
}

export enum NotificationType {
  Error = "Error",
  Info = "Info",
  None = "None",
}
