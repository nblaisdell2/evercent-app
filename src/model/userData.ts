import { EvercentData } from "../App";
import { getAPIResponse } from "../utils/api";

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

export const getAllEvercentData =
  (userEmail: string | undefined) => async () => {
    if (!userEmail) throw new Error("User Email required to get Evercent data");

    const { data, error, headers } = await getAPIResponse({
      method: "GET",
      url: "/user",
      params: {
        UserEmail: userEmail,
      },
    });

    if (error) throw new Error(error);
    return data as EvercentData;
  };

export const updateUserDetails = (userData: UserData) => async () => {
  const { data, error, headers } = await getAPIResponse({
    method: "PUT",
    url: "/user/userData",
    params: {
      UserID: userData.userID,
      BudgetID: userData.budgetID,
      MonthlyIncome: userData.monthlyIncome,
      PayFrequency: userData.payFrequency,
      NextPaydate: userData.nextPaydate,
    },
  });

  if (error) throw new Error(error);
  return data;
};

export const updateMonthsAhead =
  (userID: string, budgetID: string, newTarget: number) => async () => {
    const { data, error, headers } = await getAPIResponse({
      method: "PUT",
      url: "/user/monthsAhead",
      params: {
        UserID: userID,
        BudgetID: budgetID,
        NewTarget: newTarget,
      },
    });

    if (error) throw new Error(error);
    return data;
  };
