const { DEFAULTS, readStore, writeStore } = require("./settings.store");

const getUserSettings = (userId) => {
  const store = readStore();
  const user = store.users[userId] || {};
  return {
    theme: user.theme || "light",
    language: user.language || "en",
    notifications: user.notifications ?? true,
    dashboard_auto_refresh: user.dashboard_auto_refresh ?? true,
    ...user,
  };
};

const updateUserSettings = (userId, patch) => {
  const store = readStore();
  const previous = store.users[userId] || {};
  store.users[userId] = { ...previous, ...patch };
  writeStore(store);
  return getUserSettings(userId);
};

const getGlobalSettings = () => {
  const store = readStore();
  return { ...DEFAULTS.global, ...(store.global || {}) };
};

const updateGlobalSettings = (patch) => {
  const store = readStore();
  store.global = { ...DEFAULTS.global, ...(store.global || {}), ...patch };
  writeStore(store);
  return store.global;
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  getGlobalSettings,
  updateGlobalSettings,
};

