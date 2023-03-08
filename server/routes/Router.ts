import { Request, Response, Router as ExpressRouter } from "express";

export interface ParamsDictionary {
  [key: string]: string;
}

export interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

function forceCast<T>(input: any): T {
  // @ts-ignore
  return input;
}

export default class Router {
  private _router: ExpressRouter;
  constructor() {
    this._router = ExpressRouter();
  }

  public get Router() {
    return this._router;
  }

  public put<T>(
    path: string,
    callback: (
      req: Request<ParamsDictionary, any, T, ParsedQs, Record<string, any>>,
      res: Response<any, Record<string, any>>
    ) => any,
    validation?: {
      key: string;
      type: "string" | "number" | "boolean" | "object" | "array";
    }[]
  ) {
    this._router.put(
      path,
      (req, res, next) => {
        if (!validation) return next();

        for (const v of validation) {
          if (typeof req.body[v.key] !== v.type) {
            return res.status(400).send({ error: "Invalid types provided" });
          }
        }
        return next();
      },
      callback
    );
  }

  public post<T>(
    path: string,
    callback: (
      req: Request<ParamsDictionary, any, T, ParsedQs, Record<string, any>>,
      res: Response<any, Record<string, any>>
    ) => any
  ) {
    this._router.post(path, callback);
  }

  public get(
    path: string,
    ...callback: ((req: Request, res: Response) => any)[]
  ) {
    this._router.get(path, ...(callback as any));
  }
}
