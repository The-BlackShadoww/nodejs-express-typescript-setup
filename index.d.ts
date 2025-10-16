// import * as express from "express-serve-static-core";
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      customField?: string;
    }
  }
}

export {};