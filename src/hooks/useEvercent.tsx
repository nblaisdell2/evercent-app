import { useEffect, useState } from "react";
import { EvercentData } from "../model/evercent";
import { UserData } from "../model/userData";
import { getAPIResponse } from "../utils/api";
import { useSQLQuery } from "./useSQLQuery";
import {
  CategoryGroup,
  ExcludedCategory,
  getIncludedCategoryGroups,
} from "../model/category";
import { Budget } from "../model/budget";
import { log } from "../utils/log";
import useBudgetHelper, { BudgetHelperState } from "./useBudgetHelper";
import { useAuth0 } from "@auth0/auth0-react";

function useEvercent() {
  const { user } = useAuth0();

  const getAllEvercentData =
    (userEmail: string | undefined) => async (): Promise<EvercentData> => {
      if (!userEmail)
        throw new Error("User Email required to get Evercent data");

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

  const { data: evercentData, isLoading } = useSQLQuery(
    "get-all-evercent-data",
    getAllEvercentData(user?.email),
    !!user?.email
  );

  return {
    isLoading,
    ...(evercentData as EvercentData),
  };
}

export default useEvercent;
