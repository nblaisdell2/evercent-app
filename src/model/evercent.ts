import { AutoRun } from "./autoRun";
import { UserData } from "./userData";
import { Budget } from "./budget";
import {
  CategoryGroup,
  ExcludedCategory,
  getIncludedCategoryGroups,
} from "./category";
import { getAPIResponse } from "../utils/api";
import { log } from "../utils/log";
import { addHours, parseISO } from "date-fns";

export type EvercentData = {
  userData: UserData | undefined;
  budget: Budget | undefined;
  categoryGroups: CategoryGroup[];
  categoryGroupsAll: CategoryGroup[];
  excludedCategories: ExcludedCategory[];
  autoRuns: AutoRun[];
  pastRuns: AutoRun[];
};

export const getAllEvercentData =
  (userEmail: string | undefined) => async (): Promise<EvercentData> => {
    if (!userEmail) throw new Error("User Email required to get Evercent data");

    const { data, error, headers } = await getAPIResponse({
      method: "GET",
      url: "/user",
      params: {
        UserEmail: userEmail,
      },
    });

    if (error) throw new Error(error);

    const evercentData: EvercentData = {
      userData: data.userData,
      budget: data.budget,
      categoryGroups: getIncludedCategoryGroups(
        data.categoryGroups,
        data.excludedCategories
      ),
      categoryGroupsAll: data.categoryGroups,
      excludedCategories: data.excludedCategories,
      autoRuns: data.autoRuns,
      pastRuns: data.pastRuns,
    };
    log("Getting ALL evercent data", evercentData);

    return evercentData;
  };

export const updateCachedUserData = (
  old: EvercentData | undefined,
  newData: UserData | undefined
) => {
  if (old && newData) {
    log("updating cached user data");
    return {
      ...old,
      userData: { ...newData },
    };
  }
};

export const updateCachedCategories = (
  old: EvercentData | undefined,
  newData:
    | {
        newCategories: CategoryGroup[];
        excludedCategories: ExcludedCategory[];
        newAutoRuns: AutoRun[];
      }
    | undefined
) => {
  if (old && newData) {
    const newAutoRuns =
      old.autoRuns.length == 0
        ? []
        : newData.newAutoRuns.map((ar) => {
            return {
              ...ar,
              runTime: addHours(
                parseISO(ar.runTime),
                parseISO(old.autoRuns[0].runTime).getHours()
              ).toISOString(),
            };
          });
    log("updating cached categories", { old, newData });
    return {
      ...old,
      categoryGroups: [...newData.newCategories],
      excludedCategories: [...newData.excludedCategories],
      autoRuns: newAutoRuns,
    };
  }
};

export const updateCachedAutoRuns = (
  old: EvercentData | undefined,
  newData: AutoRun[] | undefined
) => {
  if (old && newData) {
    log("updating cached auto runs", { old, newData });
    if (newData.length == 0) return { ...old, autoRuns: [] };

    return {
      ...old,
      autoRuns: [...newData],
    };
  }
};
