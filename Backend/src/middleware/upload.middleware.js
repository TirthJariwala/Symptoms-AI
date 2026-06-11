const multer = require("multer");
const { UPLOAD_FIELD_NAME, MAX_FILE_SIZE_MB } = require("../config/constants");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const singleFileUpload = upload.single(UPLOAD_FIELD_NAME);

module.exports = { singleFileUpload };
