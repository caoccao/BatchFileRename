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
  depth: number;
  extensions: string[];
  filterByExtensions: boolean;
  includeDirectories: boolean;
  plugins: ConfigPlugin[];
}

export interface ConfigPlugin {
  code: string;
  description: string;
  id: string;
  name: string;
  options: ConfigPluginOption[];
}

export interface ConfigPluginOption<T = boolean | number | string> {
  defaultValue: T;
  name: string;
  type: ConfigPluginOptionType;
}

export interface ConfigPluginOptionBoolean extends ConfigPluginOption<boolean> {
}

export interface ConfigPluginOptionDouble extends ConfigPluginOption<number> {
}

export interface ConfigPluginOptionInteger extends ConfigPluginOption<number> {
}

export interface ConfigPluginOptionString extends ConfigPluginOption<string> {
}

export enum ConfigPluginOptionType {
  Boolean = "Boolean",
  Double = "Double",
  Integer = "Integer",
  String = "String",
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
  Success = "Success",
}
