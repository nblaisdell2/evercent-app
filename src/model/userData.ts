import { getAPIResponse } from "../utils/api";
import { log } from "../utils/log";
import { sum } from "../utils/util";
import { CategoryGroup } from "./category";

export type PayFrequency = "Weekly" | "Every 2 Weeks" | "Monthly";

export type UserData = {
  userID: string;
  budgetID: string;
  username: string;
  monthlyIncome: number;
  payFrequency: PayFrequency;
  nextPaydate: string;
  monthsAheadTarget: number;
};

export const getTotalAmountUsed = (categoryGroups: CategoryGroup[]) => {
  return sum(categoryGroups, "adjustedAmountPlusExtra");
};

export const updateUserDetails =
  (
    userData: UserData,
    monthlyIncome: number,
    payFrequency: string,
    nextPaydate: string
  ) =>
  async () => {
    const { userID, budgetID } = userData;

    log("updating user details with params:", {
      UserID: userID,
      BudgetID: budgetID,
      MonthlyIncome: monthlyIncome,
      PayFrequency: payFrequency,
      NextPaydate: nextPaydate,
    });

    const { data, error, headers } = await getAPIResponse({
      method: "PUT",
      url: "/user/userData",
      params: {
        UserID: userID,
        BudgetID: budgetID,
        MonthlyIncome: monthlyIncome,
        PayFrequency: payFrequency,
        NextPaydate: nextPaydate,
      },
    });

    if (error) throw new Error(error);

    const newUserData = {
      ...userData,
      monthlyIncome,
      payFrequency: payFrequency as PayFrequency,
      nextPaydate,
    };
    return newUserData;
  };

export const updateMonthsAhead =
  (userData: UserData, newTarget: number) => async () => {
    const { data, error, headers } = await getAPIResponse({
      method: "PUT",
      url: "/user/monthsAhead",
      params: {
        UserID: userData.userID,
        BudgetID: userData.budgetID,
        NewTarget: newTarget,
      },
    });

    if (error) throw new Error(error);

    const newUserData = {
      ...userData,
      monthsAheadTarget: newTarget,
    };
    return newUserData;
  };
