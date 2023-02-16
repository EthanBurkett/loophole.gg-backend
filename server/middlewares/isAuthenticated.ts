import { Request, Response, NextFunction } from "express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) =>
  req.user ? next() : res.status(403).send({ msg: "Unauthorized" });

export default isAuthenticated;
