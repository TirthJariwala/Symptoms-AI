const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "cases.json");

let cases = [];

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const load = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      cases = JSON.parse(raw);
    }
  } catch {
    cases = [];
  }
};

const persist = () => {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(cases, null, 2), "utf8");
};

load();

const addCase = (record) => {
  const existing = cases.findIndex((c) => c.case_id === record.case_id);
  if (existing >= 0) {
    cases[existing] = record;
  } else {
    cases.unshift(record);
  }
  persist();
  return record;
};

const listCases = (userId = null) => {
  if (!userId) return [...cases];
  return cases.filter((c) => c.user_id === userId);
};

const getCase = (caseId) => cases.find((c) => c.case_id === caseId) || null;

module.exports = { addCase, listCases, getCase, load };
