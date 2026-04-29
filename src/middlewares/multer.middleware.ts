import multer from "multer";
import os from "os";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: function (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    // cb(null, "./public/temp");
    // cb(null, "/tmp");
    cb(null, os.tmpdir()); //! Node handles the correct path for each OS
  },

  filename: function (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    cb(null, file.originalname);
  },

  //   filename: function (req, file, cb) {
  //     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  //     cb(null, file.fieldname + "-" + uniqueSuffix);
  //   },
});

export const upload = multer({ storage: storage });
