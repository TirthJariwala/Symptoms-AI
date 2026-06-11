const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "settings.json");

const DEFAULTS = {
  global: {
    confidence_threshold: 0.7,
    realtime_poll_ms: 5000,
    allow_feedback: true,
    maintenance_mode: false,
  },
  users: {},
};

const ensureStore = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULTS, null, 2), "utf8");
  }
};

const readStore = () => {
  ensureStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULTS };
  }
};

const writeStore = (data) => {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
};

module.exports = { DEFAULTS, readStore, writeStore };

