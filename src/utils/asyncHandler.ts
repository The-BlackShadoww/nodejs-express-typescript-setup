import { Request, Response, NextFunction } from "express";

//todo with promise
const asyncHandler = (
  requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

//todo with try catch
// const asyncHandler = () => {};
// const asyncHandler = () => {() => {}};
// const asyncHandler = () => () => {};
// const asyncHandler = (fn) => async () => {};

// //! This is a higher order function that returns a function
// const asyncHandler = (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     await fn(req, res, next);
//   } catch (e: any) {
//     res.status(e.code || 500).json({ success: false, message: e.message });
//   }
// };

// export { asyncHandler };
