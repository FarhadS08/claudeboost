import fs from "fs";
import path from "path";

const CLAUDEBOOST_DIR = path.join(process.env.HOME!, ".claudeboost");
const HISTORY_FILE = path.join(CLAUDEBOOST_DIR, "history.json");
const CONFIG_FILE = path.join(CLAUDEBOOST_DIR, "config.json");
const SETTINGS_FILE = path.join(CLAUDEBOOST_DIR, "settings.json");

const DEFAULT_CONFIG: Record<string, string> = {
  data_science: "",
  data_engineering: "",
  business_analytics: "",
  general_coding: "",
  documentation: "",
  devops: "",
  other: "",
};

const DEFAULT_SETTINGS = { boost_level: "medium", auto_boost: true };

function ensureDir() {
  if (!fs.existsSync(CLAUDEBOOST_DIR))
    fs.mkdirSync(CLAUDEBOOST_DIR, { recursive: true });
}

function readJSON<T>(filePath: string, fallback: T): T {
  ensureDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readHistory() {
  return readJSON<unknown[]>(HISTORY_FILE, []);
}
export function writeHistory(data: unknown[]) {
  writeJSON(HISTORY_FILE, data);
}
export function readConfig() {
  return readJSON(CONFIG_FILE, DEFAULT_CONFIG);
}
export function writeConfig(data: Record<string, string>) {
  writeJSON(CONFIG_FILE, data);
}
export function readSettings() {
  return readJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
}
export function writeSettings(data: Record<string, unknown>) {
  writeJSON(SETTINGS_FILE, data);
}
