import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { sendEmailMessage } from "./utils/email";
import { log, logError } from "./utils/log";
import { EvercentResponse } from "evercent/dist/evercent";
import {
  cancelAutoRuns,
  connectToYNAB,
  getAllEvercentData,
  getBudgetsList,
  lockAutoRuns,
  runAutomation,
  saveAutoRunDetails,
  switchBudget,
  updateBudgetCategoryAmount,
  updateCategoryDetails,
  updateMonthsAheadTarget,
  updateUserDetails,
} from "evercent/dist/endpoints";

export type FnType<T> = T extends (...args: any) => any
  ? FnType<ReturnType<T>>
  : T extends Promise<infer K>
  ? FnType<Awaited<K>>
  : T extends EvercentResponse<infer K>
  ? T["data"]
  : T;

const sendErrorEmail = async (
  mutate: boolean,
  response: EvercentResponse<any>,
  opts: any
) => {
  const errorMessage = `(${500}) - GET /${opts.path} :: ${response.err}`;
  logError(errorMessage);

  const method = mutate ? "POST" : "GET";
  const errMsgHTML = `
  <b style="color:${
    method == "GET" ? "green" : "orange"
  }">${method}</b> <span>/${(opts as any).path}</span><br/>
  <u><b>Error</b></u>: <span>${response.err}</span><br/><br/>
  <u><b>Inputs</b></u>: <span style="font-size: 85%; font-family: 'Courier New'">${JSON.stringify(
    opts.input
  )}</span>
  `;

  await sendEmailMessage({
    from: "Evercent API <nblaisdell2@gmail.com>",
    to: "nblaisdell2@gmail.com",
    subject: "Error!",
    message: errMsgHTML,
    attachments: [],
    useHTML: true,
  });
};

const checkAPIStatus = async (): Promise<EvercentResponse<string>> => {
  const msg = "API is up-and-running!";
  return {
    data: msg,
    err: null,
    message: msg,
  };
};

const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

export const getProcQuery = <
  Fn extends (...args: any) => Promise<EvercentResponse<O>>,
  P = Parameters<Fn>[0],
  O = FnType<Fn>
>(
  fn: Fn
) => {
  return publicProcedure.input(z.custom<P>()).query(async (opts) => {
    const response = await fn(opts.input);
    if (response.err) sendErrorEmail(false, response, opts);
    return response;
  });
};

export const getProcMutation = <
  Fn extends (...args: any) => Promise<EvercentResponse<O>>,
  P = Parameters<Fn>[0],
  O = FnType<Fn>
>(
  fn: Fn
) => {
  const mut = publicProcedure.input(z.custom<P>()).mutation(async (opts) => {
    const response = await fn(opts.input);
    if (response.err) sendErrorEmail(true, response, opts);
    return response;
  });
  return mut;
};

export const appRouter = router({
  getAPIStatus: getProcQuery(checkAPIStatus),
  user: router({
    getAllUserData: getProcQuery(getAllEvercentData),
    updateUserDetails: getProcMutation(updateUserDetails),
    updateCategoryDetails: getProcMutation(updateCategoryDetails),
    updateMonthsAheadTarget: getProcMutation(updateMonthsAheadTarget),
  }),
  budget: router({
    connectToYNAB: getProcMutation(connectToYNAB),
    getBudgetsList: getProcQuery(getBudgetsList),
    switchBudget: getProcMutation(switchBudget),
    updateBudgetCategoryAmount: getProcMutation(updateBudgetCategoryAmount),
  }),
  autoRun: router({
    saveAutoRunDetails: getProcMutation(saveAutoRunDetails),
    cancelAutoRuns: getProcMutation(cancelAutoRuns),
    lockAutoRuns: getProcMutation(lockAutoRuns),
    runAutomation: getProcMutation(runAutomation),
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
