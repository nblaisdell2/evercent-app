import { getAPIResponse } from "../utils/api";
import { log } from "../utils/log";

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

export const updateUserDetails = async ({
  userData,
  monthlyIncome,
  payFrequency,
  nextPaydate,
}: {
  userData: UserData;
  monthlyIncome: number;
  payFrequency: string;
  nextPaydate: string;
}) => {
  const { userID, budgetID } = userData;

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

export const updateMonthsAheadTarget = async ({
  userData,
  newTarget,
}: {
  userData: UserData;
  newTarget: number;
}) => {
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

export const getAmountByPayFrequency = (
  amount: number,
  payFreq: PayFrequency
) => {
  switch (payFreq) {
    case "Weekly":
      return amount / 4;
    case "Every 2 Weeks":
      return amount / 2;
    case "Monthly":
      return amount;
    default:
      return 0;
  }
};
