import { getAPIResponse } from "../utils/api";

export type CategoryGroup = {
  groupID: string;
  groupName: string;
  amount: number;
  extraAmount: number;
  adjustedAmount: number;
  adjustedAmountPlusExtra: number;
  categories: Category[];
};

export type Category = {
  guid: string;
  categoryGroupID: string;
  categoryID: string;
  name: string;
  amount: number;
  extraAmount: number;
  adjustedAmount: number;
  adjustedAmountPlusExtra: number;
  monthsAhead: number;
  postingMonths: PostingMonth[];
  regularExpenseDetails: RegularExpenses | null;
  upcomingDetails: UpcomingExpenses | null;
};

export type RegularExpenses = {
  guid: string;
  isMonthly: boolean;
  nextDueDate: string;
  monthsDivisor: number;
  repeatFreqNum: number;
  repeatFreqType: string;
  includeOnChart: boolean;
  multipleTransactions: boolean;
};

export type UpcomingExpenses = {
  guid: string;
  expenseAmount: number;
};

export type UpcomingExpenseDetails = {
  guid: string;
  categoryName: string;
  amountSaved: number;
  totalAmount: number;
  purchaseDate: string;
  daysAway: number;
  paychecksAway: number;
};

export type PostingMonth = {
  month: string;
  amount: number;
  percent: number;
};

export type ExcludedCategory = Pick<
  Category,
  "guid" | "categoryGroupID" | "categoryID"
>;

const getAllCategories = (categoryGroups: CategoryGroup[]) => {
  return categoryGroups.reduce((prev, curr) => {
    return [...prev, ...curr.categories];
  }, [] as Category[]);
};

const formatCategories = (
  categoryGroups: CategoryGroup[],
  excludedCategories: ExcludedCategory[]
) => {
  let formattedResults = {
    details: [] as any,
    expense: [] as any,
    upcoming: [] as any,
    excluded: [] as any,
  };

  const allCategories = getAllCategories(categoryGroups);
  for (let i = 0; i < allCategories.length; i++) {
    const currCat = allCategories[i];
    if (currCat) {
      const isRegularExpense = currCat.regularExpenseDetails != null;
      const isUpcomingExpense = currCat.upcomingDetails != null;

      formattedResults.details.push({
        guid: currCat.guid,
        categoryGroupID: currCat.categoryGroupID,
        categoryID: currCat.categoryID,
        amount: currCat.amount,
        extraAmount: currCat.extraAmount,
        isRegularExpense: isRegularExpense,
        isUpcomingExpense: isUpcomingExpense,
      });

      if (isRegularExpense) {
        formattedResults.expense.push({
          guid: currCat.guid,
          isMonthly: currCat.regularExpenseDetails?.isMonthly,
          nextDueDate: currCat.regularExpenseDetails?.nextDueDate,
          expenseMonthsDivisor: currCat.regularExpenseDetails?.monthsDivisor,
          repeatFreqNum: currCat.regularExpenseDetails?.repeatFreqNum,
          repeatFreqType: currCat.regularExpenseDetails?.repeatFreqType,
          includeOnChart: currCat.regularExpenseDetails?.includeOnChart,
          multipleTransactions:
            currCat.regularExpenseDetails?.multipleTransactions,
        });
      }

      if (isUpcomingExpense) {
        formattedResults.upcoming.push({
          guid: currCat.guid,
          totalExpenseAmount: currCat.upcomingDetails?.expenseAmount,
        });
      }
    }
  }

  for (let i = 0; i < excludedCategories.length; i++) {
    formattedResults.excluded.push({
      guid: excludedCategories[i]?.guid,
    });
  }

  return formattedResults;
};

export const updateCategoryData =
  (
    userID: string,
    budgetID: string,
    newCategories: CategoryGroup[],
    excludedCategories: ExcludedCategory[]
  ) =>
  async () => {
    const formattedCategories = formatCategories(
      newCategories,
      excludedCategories
    );
    const { data, error, headers } = await getAPIResponse({
      method: "PUT",
      url: "/user/categoryData",
      params: {
        UserID: userID,
        BudgetID: budgetID,
        Details: JSON.stringify(formattedCategories),
      },
    });

    if (error) throw new Error(error);
    return data;
  };
