import { diskStorage } from "multer";

const DESTINATION_PATH = "logos/";

export const LogoDiskStorage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, DESTINATION_PATH);
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".")[1];
    const name = `${file.originalname.split(".")[0]}-${Date.now()}`;
    const fileName = `${name}.${extension}`;
    cb(null, fileName);
  },
});
