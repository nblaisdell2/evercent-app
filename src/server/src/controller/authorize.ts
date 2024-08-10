import { Request, Response, NextFunction } from "express";
import { log } from "../utils/log";
import { authorizeBudget } from "evercent/dist/endpoints";

export const authorize = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { code, state } = req.query;

  const data = await authorizeBudget(state as string, code as string);
  if (data) {
    res.redirect(data.data?.redirectURL as string);
  } else {
    res.redirect(process.env.SERVER_CLIENT_BASE_URL as string);
  }
  //   next({ data: { status: "Router other than tRPC" } });
};
