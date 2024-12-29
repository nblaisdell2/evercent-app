import { useAuth0 } from "@auth0/auth0-react";
import { useSQLMutation2 } from "./useSQLMutation2";
import { useSQLQuery2 } from "./useSQLQuery2";
import { UserData } from "evercent/dist/user";
import { AutoRun } from "evercent/dist/autoRun";
import { EvercentData } from "evercent/dist/evercent";
import { CategoryGroup, ExcludedCategory } from "evercent/dist/category";
import { log } from "../utils/log";

export type QueryLoadingState = null | "" | "loading" | "saved";

function useEvercent() {
  const { user } = useAuth0();
  const email = {
    userEmail: user?.email as string,
  };

  const updateCachedUserData = (
    oldData: any,
    newData: Partial<UserData> | null | undefined
  ) => {
    if (oldData?.data && newData) {
      return {
        ...oldData,
        data: {
          ...oldData.data,
          userData: {
            ...oldData.data.userData,
            ...newData,
          },
        },
      };
    }
  };

  const updateCachedCategories = (
    oldData: any,
    newData:
      | {
          newCategories: CategoryGroup[];
          excludedCategories: ExcludedCategory[];
          newAutoRuns: AutoRun[];
        }
      | undefined
  ) => {
    if (oldData?.data && newData) {
      return {
        ...oldData,
        data: {
          ...oldData.data,
          categoryGroups: [...newData.newCategories],
          excludedCategories: [...newData.excludedCategories],
          autoRuns: [...newData.newAutoRuns],
        },
      };
    }
  };

  const updateCachedAutoRuns = (
    old: any,
    newData: { autoRuns: AutoRun[] } | undefined
  ) => {
    log("Checking...........");
    log(old);
    log(newData);
    if (old?.data && newData) {
      if (newData?.autoRuns?.length == 0) {
        return {
          ...old,
          data: {
            ...old.data,
            autoRuns: [],
          },
        };
      }

      return {
        ...old,
        data: {
          ...old.data,
          autoRuns: [...newData?.autoRuns],
        },
      };
    }
  };

  const saveAutoRuns = () => {
    return useSQLMutation2(
      "autoRun",
      "saveAutoRunDetails",
      "user",
      "getAllUserData",
      false,
      updateCachedAutoRuns
    );
  };

  const cancelAutoRuns = () => {
    return useSQLMutation2(
      "autoRun",
      "cancelAutoRuns",
      "user",
      "getAllUserData",
      false,
      updateCachedAutoRuns
    );
  };

  const updateUserDetails = () => {
    return useSQLMutation2(
      "user",
      "updateUserDetails",
      "user",
      "getAllUserData",
      false,
      updateCachedUserData
    );
  };

  const updateMonthsAhead = () => {
    return useSQLMutation2(
      "user",
      "updateMonthsAheadTarget",
      "user",
      "getAllUserData",
      false,
      updateCachedUserData
    );
  };

  const updateCategories = () => {
    return useSQLMutation2(
      "user",
      "updateCategoryDetails",
      "user",
      "getAllUserData",
      false,
      updateCachedCategories
    );
  };

  const changeBudget = () => {
    return useSQLMutation2("budget", "switchBudget");
  };

  const connectToYNAB = () => {
    return useSQLMutation2("budget", "connectToYNAB");
  };

  const { data, isLoading } = useSQLQuery2(
    "user",
    "getAllUserData",
    email,
    !!user?.email
  );

  let evercentData: EvercentData | null = null;

  if (data?.data) {
    evercentData = { ...data.data };
  }

  log(
    "[useEvercent()] - About to return evercent data",
    isLoading,
    evercentData
  );

  return {
    isLoading,
    ...evercentData,

    updateUserDetails,
    updateMonthsAhead,
    updateCategories,
    changeBudget,

    connectToYNAB,

    saveAutoRuns,
    cancelAutoRuns,
  };
}

export default useEvercent;
