import { diskStorage } from "multer";
import { User } from "../../entities/user.entity";
import * as fs from "fs";

const DESTINATION_PATH = "src/users/cv-files/";

export const DiskStorage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, DESTINATION_PATH);
  },
  filename: function (req, file, cb) {
    const authenticatedUser = req.user as User;
    const fileName = `${authenticatedUser.id}-${Date.now()}`;
    const files = fs.readdirSync(DESTINATION_PATH);
    for (const file of files) {
      if (file.split("-")[0] === authenticatedUser.id.toString()) {
        fs.unlinkSync(`${DESTINATION_PATH}${file}`);
      }
    }
    cb(null, `${fileName}.pdf`);
  },
});
