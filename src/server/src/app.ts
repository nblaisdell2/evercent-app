const express = require("express");
const cors = require("cors");
import { json, urlencoded } from "express";
import authorizeRouter from "./router/authorizeRouter";

import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { config } from "dotenv";
config();

const app = express();

// Makes sure our API can only accept URL-encoded strings, or JSON data
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://evercent.net",
      "https://api.ynab.com",
    ],
  })
);

// The YNAB API sends the data in the query parameters in a particular way,
// which is not compatible with tRPC. As a result, we'll have this endpoint
// separate from tRPC, and if the given request does not match this endpoint,
// it will then be handled by tRPC.
app.use("/authorizeBudget", authorizeRouter);

// created for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({}); // no context

// tRPC
app.use(
  "/",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
