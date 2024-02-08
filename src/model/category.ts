import {
  addMonths,
  addWeeks,
  differenceInDays,
  differenceInMonths,
  isEqual,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfToday,
} from "date-fns";
import { getAPIResponse } from "../utils/api";
import { log } from "../utils/log";
import { generateUUID, roundNumber, sum } from "../utils/util";
import {
  Budget,
  BudgetMonth,
  BudgetMonthCategory,
  getBudgetCategory,
  getBudgetMonth,
} from "./budget";
import {
  PayFrequency,
  UserData,
  getAmountByPayFrequency,
  incrementDateByFrequency,
} from "./userData";
import {
  AutoRun,
  AutoRunCategoryGroup,
  generateAutoRunCategoryGroups,
} from "./autoRun";

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
  groupName: string;
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

  const allCategories = getAllCategories(categoryGroups, true);
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

export const updateCategoryData = async ({
  userData,
  newCategories,
  excludedCategories,
}: {
  userData: UserData;
  newCategories: CategoryGroup[];
  excludedCategories: ExcludedCategory[];
}) => {
  log("are these categories new?", newCategories);
  const formattedCategories = formatCategories(
    newCategories,
    excludedCategories
  );
  log("formatted categories", formattedCategories);
  // log("formatted categories", JSON.stringify(formattedCategories));

  const { data, error, headers } = await getAPIResponse({
    method: "PUT",
    url: "/user/categoryData",
    params: {
      UserID: userData.userID,
      BudgetID: userData.budgetID,
      Details: JSON.stringify(formattedCategories),
    },
  });

  log("error & data", { error, data });
  if (error) return Promise.reject(error);

  let autoRunList: AutoRun[] = [];
  let dtRunTime = parseISO(userData.nextPaydate);
  for (let i = 0; i < 10; i++) {
    let autoRunGroups: AutoRunCategoryGroup[] = [];
    if (i == 0) {
      autoRunGroups = generateAutoRunCategoryGroups(
        newCategories,
        userData.payFrequency
      );
    }

    if (autoRunList[i]) {
      autoRunList[i] = {
        ...autoRunList[i],
        runID: autoRunList[i].runID,
        runTime: dtRunTime.toISOString(),
        isLocked: autoRunList[i].isLocked,
        categoryGroups: autoRunGroups,
      };
    } else {
      autoRunList.push({
        runID: generateUUID().toUpperCase(),
        runTime: dtRunTime.toISOString(),
        isLocked: false,
        categoryGroups: autoRunGroups,
      });
    }
    dtRunTime = incrementDateByFrequency(dtRunTime, userData.payFrequency);
  }

  return { newCategories, excludedCategories, newAutoRuns: autoRunList };
};

/////////////////////////////////////////
////////// CATEGORY FUNCTIONS ///////////
/////////////////////////////////////////

const getNumberOfMonthsByFrequency = (
  regularExpenseDetails: RegularExpenses | undefined
): number => {
  if (!regularExpenseDetails) return 1;
  return (
    regularExpenseDetails.repeatFreqNum *
    (regularExpenseDetails.repeatFreqType == "Months" ? 1 : 12)
  );
};

const getAmountByFrequency = (
  amount: number,
  regularExpenseDetails: RegularExpenses | null
) => {
  if (!regularExpenseDetails) return amount;

  const numMonths = getNumberOfMonthsByFrequency(regularExpenseDetails);
  return amount / numMonths;
};

const calculateMonthsAhead = (
  category: Category,
  months: BudgetMonth[],
  payFreq: PayFrequency,
  nextPaydate: string
): number => {
  if (category.adjustedAmountPlusExtra == 0) return 0;

  let monthsAhead = 0;
  let postingMonths = getPostingMonths(
    category,
    months,
    payFreq,
    nextPaydate,
    25
  );

  // We don't consider the current month when referencing our "months ahead"
  // number, so remove the current month if it's there
  if (isEqual(parseISO(postingMonths[0].month), startOfMonth(new Date()))) {
    postingMonths.shift();
  }

  // Loop through each posting month and determine if we've already budgeted
  // the expected amount in our actual budget. If so, increment the monthsAhead
  // value and continue to the next month until either all months are exhausted,
  // or we find a month where we haven't budgeted enough yet
  for (let i = 0; i < postingMonths.length; i++) {
    const currPM = postingMonths[i];
    // log("calculating months ahead");
    const bm = getBudgetMonth(months, parseISO(currPM.month));
    const bc = getBudgetCategory(
      bm,
      category.categoryGroupID,
      category.categoryID
    );

    if (bc.budgeted < currPM.amount) break;

    monthsAhead += 1;
  }

  return monthsAhead;
};

const calculateAdjustedAmount = (
  category: Category,
  months: BudgetMonth[],
  recalculate: boolean,
  temporary?: boolean,
  override?: boolean
): number => {
  // If it's not a regular expense, or if it is a regular expense,
  // and it's a monthly expense, simply return the user's entered category amount
  if (
    !category.regularExpenseDetails ||
    category.regularExpenseDetails.isMonthly
  ) {
    return category.amount;
  }

  // If we've excluded it from the chart, just return 0 here
  if (!category.regularExpenseDetails.includeOnChart) {
    return 0;
  }

  log("calculating adjusted amount for " + category.name);

  let numMonths = 0;
  if (!recalculate) {
    numMonths = category.regularExpenseDetails.monthsDivisor;
  } else if (temporary) {
    numMonths = getNumberOfMonthsByFrequency(category.regularExpenseDetails);
  } else {
    // Get BudgetMonthCategory from the same month of
    // this category's next due date
    log("calculating adjusted amount");
    const budgetMonth = getBudgetMonth(
      months,
      parseISO(category.regularExpenseDetails.nextDueDate)
    );
    log("budgetMonth", budgetMonth);
    if (budgetMonth) {
      const budgetCategory = getBudgetCategory(
        budgetMonth,
        category.categoryGroupID,
        category.categoryID
      );
      log("budgetCategory", budgetCategory);

      if (budgetCategory) {
        if (!override && budgetCategory.available >= category.amount) {
          numMonths = getNumberOfMonthsByFrequency(
            category.regularExpenseDetails
          );
        } else {
          // Calculate the # of months between today and the
          // category's next due date
          const dtThisMonth = startOfMonth(new Date());
          const dtDueDate = startOfMonth(
            parseISO(category.regularExpenseDetails.nextDueDate)
          );
          log("dates", {
            thisMonth: dtThisMonth.toISOString(),
            dueDate: dtDueDate.toISOString(),
          });
          numMonths = differenceInMonths(dtDueDate, dtThisMonth) + 1;
        }
      }
    }
  }

  if (numMonths == 0) return category.amount;

  log("numMonths", numMonths);
  const catAmtDivided = category.amount / numMonths;

  const catAmtByFreq = getAmountByFrequency(
    category.amount,
    category.regularExpenseDetails
  );

  // When we have fewer months than expected to pay something off, we'll
  // need to pay more per month, which is accounted for in the "catAmtDivided > catAmtByFreq"
  // statement. However, when we have many months ahead to pay it off, and the amount
  // would be much lower than expected per month, we'll still pay off the amount by
  // frequency, instead of that much lower amount, which can be difficult to keep
  // track of.
  let finalAdjAmt = 0;
  if (catAmtDivided > catAmtByFreq) {
    finalAdjAmt = catAmtDivided;
  } else {
    finalAdjAmt = catAmtByFreq;
  }

  if (!Number.isInteger(finalAdjAmt)) {
    log("NOT A WHOLE NUMBER", finalAdjAmt);
    finalAdjAmt += 0.01;
  } else {
    log("IS A WHOLE NUMBER", finalAdjAmt);
  }

  return finalAdjAmt;
};

export const getPostingMonths = (
  category: Category,
  months: BudgetMonth[],
  payFreq: PayFrequency,
  nextPaydate: string,
  overrideNum?: number | undefined
): PostingMonth[] => {
  const DEBUG = category.name == "Car Taxes"; // && overrideNum == undefined;

  if (DEBUG) log("category", { category, payFreq, nextPaydate, overrideNum });

  let postingMonths: PostingMonth[] = [];
  const useOverride = overrideNum != undefined;

  let totalAmt = getAmountByPayFrequency(
    category.adjustedAmountPlusExtra,
    payFreq
  );

  let totalDesired =
    overrideNum == undefined
      ? category.adjustedAmount
      : calculateAdjustedAmount(category, months, true, false, true);

  let currMonth = parseISO(nextPaydate);

  if (DEBUG) {
    log("amounts", {
      totalAmt,
      totalDesired,
      currMonth,
      useOverride,
    });
  }

  // Keep finding months until
  //  1. We run out of money (totalAmt)
  //  2. We override the # of months, and haven't reached that
  //     # of months yet
  while (
    (!useOverride && totalAmt > 0) ||
    (useOverride && postingMonths.length < overrideNum)
  ) {
    if (DEBUG) log("getting budget month", { currMonth, totalAmt });
    // log("getPostingMonths");
    const bm = getBudgetMonth(months, currMonth);
    if (!bm) {
      if (DEBUG) log("Gotta leave!");
      return postingMonths;
    }

    const bc = getBudgetCategory(
      bm,
      category.categoryGroupID,
      category.categoryID
    );

    let desiredPostAmt = -1;
    if (bc) {
      if (!useOverride) {
        // Get YNAB category "budgeted" amount
        // (use 0 if negative)
        if (bc.budgeted < totalDesired) {
          desiredPostAmt = totalDesired - bc.budgeted;
        }
      } else {
        desiredPostAmt = totalDesired;
      }

      if (DEBUG) log("desiredPostAmt", { desiredPostAmt });

      if (
        // useOverride &&
        isEqual(parseISO(bm.month), startOfMonth(new Date())) &&
        !category.regularExpenseDetails?.multipleTransactions &&
        bc.activity < 0
      ) {
        if (DEBUG) log("SKIPPING TO NEXT MONTH");
        currMonth = addMonths(currMonth, 1);
        continue;
      }

      if (desiredPostAmt !== -1) {
        let postAmt = useOverride
          ? desiredPostAmt
          : Math.min(totalAmt, desiredPostAmt);

        if (DEBUG) log("postAmt", roundNumber(postAmt, 2));
        if (roundNumber(postAmt, 2) <= 0) {
          currMonth = addMonths(currMonth, 1);
          continue;
        }

        // if (!Number.isInteger(postAmt)) {
        //   log("NOT A WHOLE NUMBER", postAmt);
        //   postAmt += 0.01;
        // } else {
        //   log("IS A WHOLE NUMBER", postAmt);
        // }

        if (DEBUG) {
          log("Adding posting month!", {
            month: parseISO(bm.month).toISOString(),
            amount: postAmt,
            percent: 0,
          });
        }
        postingMonths.push({
          month: parseISO(bm.month).toISOString(),
          amount: postAmt,
          percent: 0,
        });

        totalAmt -= postAmt;

        // recalculate totalDesired using repeat frequency here
        // because of non-monthly regular expense && due date month is currMonth
        // && ynab available == category.amount
        if (DEBUG)
          log("gotta recalculate?", {
            category,
            bc,
            currMonth,
            overrideNum,
          });
        if (
          (overrideNum == undefined &&
            dueDateAndAmountSet(
              category.regularExpenseDetails?.isMonthly,
              category.regularExpenseDetails?.nextDueDate,
              category.amount,
              bc,
              currMonth
            )) ||
          (overrideNum != undefined &&
            category?.regularExpenseDetails?.nextDueDate &&
            isEqual(
              startOfMonth(currMonth),
              startOfMonth(parseISO(category.regularExpenseDetails.nextDueDate))
            ))
        ) {
          log(
            "Recalculating totalDesired due to due date being met for category!"
          );
          const temporary = overrideNum == undefined ? undefined : true;
          totalDesired = calculateAdjustedAmount(
            category,
            months,
            true,
            temporary
          );
          log({ totalDesired });
        }
      }
    }

    if (DEBUG) log("ADVANCING TO NEXT MONTH");
    currMonth = addMonths(currMonth, 1);
  }

  return postingMonths;
};

const createRegularExpense = (
  guid: string,
  nextPaydate: string
): RegularExpenses => {
  return {
    guid: guid,
    isMonthly: true,
    nextDueDate: nextPaydate,
    monthsDivisor: 1,
    repeatFreqNum: 1,
    repeatFreqType: "Months",
    includeOnChart: true,
    multipleTransactions: false,
  };
};

const createUpcomingExpense = (guid: string): UpcomingExpenses => {
  return {
    guid,
    expenseAmount: 0,
  };
};

const calculateCategoryFields = (
  budget: Budget,
  category: Category,
  payFrequency: PayFrequency,
  nextPaydate: string,
  recalculateAdjusted: boolean
) => {
  log("categoryIn", category);
  const newCategory = { ...category };

  if (recalculateAdjusted) {
    log("Recalculating adjusted amount");
    const newAdjustedAmount = calculateAdjustedAmount(
      newCategory,
      budget.months,
      true
    );
    log("new adjusted amount", newAdjustedAmount);
    newCategory.adjustedAmount = newAdjustedAmount;
  }

  newCategory.adjustedAmountPlusExtra =
    newCategory.adjustedAmount + newCategory.extraAmount;

  const newMonthsAhead = calculateMonthsAhead(
    newCategory,
    budget.months,
    payFrequency,
    nextPaydate
  );
  newCategory.monthsAhead = newMonthsAhead;

  const newPostingMonths = getPostingMonths(
    newCategory,
    budget.months,
    payFrequency,
    nextPaydate
  );
  newCategory.postingMonths = newPostingMonths;

  // log("newCategoryOut", newCategory);
  return newCategory;
};

export const createCategory = (
  budget: Budget,
  categoryGroupsAll: CategoryGroup[],
  groupID: string,
  categoryID: string
) => {
  const budgetCategory = getBudgetCategory(
    getBudgetMonth(budget.months, new Date()),
    groupID,
    categoryID
  );

  let guid = generateUUID().toUpperCase();
  const cg = categoryGroupsAll.find(
    (cg) => cg.groupID.toLowerCase() == groupID.toLowerCase()
  );
  if (cg) {
    const cat = cg.categories.find(
      (c) => c.categoryID.toLowerCase() == categoryID.toLowerCase()
    );
    if (cat) {
      guid = cat.guid.toUpperCase();
    }
  }

  const category: Category = {
    guid,
    categoryGroupID: groupID.toUpperCase(),
    categoryID: categoryID.toUpperCase(),
    groupName: budgetCategory.categoryGroupName,
    name: budgetCategory.name,
    amount: 0,
    extraAmount: 0,
    adjustedAmount: 0,
    adjustedAmountPlusExtra: 0,
    regularExpenseDetails: null,
    upcomingDetails: null,
    monthsAhead: 0,
    postingMonths: [],
  };

  return category;
};

export const updateCategoryAmount = (
  budget: Budget,
  category: Category,
  payFrequency: PayFrequency,
  nextPaydate: string,
  key: "amount" | "extraAmount",
  newAmount: number
) => {
  if (newAmount <= 0) newAmount = 0;
  let newCategory = { ...category, [key]: newAmount };

  newCategory = calculateCategoryFields(
    budget,
    newCategory,
    payFrequency,
    nextPaydate,
    key == "amount"
  );

  return newCategory;
};

export const updateCategoryExpenseDetails = (
  budget: Budget,
  category: Category,
  payFrequency: PayFrequency,
  nextPaydate: string,
  key:
    | "nextDueDate"
    | "isMonthly"
    | "repeatFreqNum"
    | "repeatFreqType"
    | "includeOnChart"
    | "multipleTransactions",
  value: any
) => {
  log("updating expense details for key = " + key, value, category);

  let newCategory = {
    ...category,
    regularExpenseDetails: {
      ...category.regularExpenseDetails,
      [key]: value,
    } as RegularExpenses | null,
  };

  const regExpenses = newCategory.regularExpenseDetails as RegularExpenses;
  if (key == "isMonthly" && value) {
    regExpenses.repeatFreqNum = 1;
    regExpenses.repeatFreqType = "Months";
    regExpenses.monthsDivisor = 1;
  }

  if (key == "nextDueDate") {
    const bmCat = getBudgetCategory(
      getBudgetMonth(
        budget.months,
        parseISO(regExpenses.nextDueDate as string)
      ),
      newCategory.categoryGroupID,
      newCategory.categoryID
    );
    // console.log("========BM CAT==========");
    // console.log(bmCat);
    if (bmCat.available >= newCategory.amount || bmCat.activity < 0) {
      regExpenses.monthsDivisor = getNumberOfMonthsByFrequency(regExpenses);
    } else {
      regExpenses.monthsDivisor =
        differenceInMonths(
          startOfMonth(parseISO(value)),
          startOfMonth(startOfToday())
        ) + 1;
    }
  }

  console.log("newCategory", newCategory);

  newCategory = calculateCategoryFields(
    budget,
    newCategory,
    payFrequency,
    nextPaydate,
    true
  );
  console.log("newCategoryCalc", newCategory);

  return newCategory;
};

export const updateCategoryUpcomingAmount = (
  budget: Budget,
  category: Category,
  payFrequency: PayFrequency,
  nextPaydate: string,
  newAmount: number
) => {
  let newCategory = {
    ...category,
    upcomingDetails: {
      ...category.upcomingDetails,
      expenseAmount: newAmount,
    } as UpcomingExpenses | null,
  };

  newCategory = calculateCategoryFields(
    budget,
    newCategory,
    payFrequency,
    nextPaydate,
    true
  );

  return newCategory;
};

export const toggleCategoryOptions = (
  userData: UserData,
  budget: Budget,
  category: Category,
  checked: boolean,
  option: string
) => {
  let newCategory = { ...category };

  const isRegularExpense = option == "Regular Expense" ? checked : false;
  const isUpcomingExpense = option == "Upcoming Expense" ? checked : false;

  newCategory.regularExpenseDetails = !isRegularExpense
    ? null
    : createRegularExpense(newCategory.guid, userData.nextPaydate);

  newCategory.upcomingDetails = !isUpcomingExpense
    ? null
    : createUpcomingExpense(newCategory.guid);

  console.log("category before", newCategory);

  newCategory = calculateCategoryFields(
    budget,
    newCategory,
    userData.payFrequency,
    userData.nextPaydate,
    true
  );
  console.log("category AFTER", newCategory);

  return newCategory;
};

/** Returns a filtered CategoryGroup[] excluding any categories that have been excluded by the user */
export const getIncludedCategoryGroups = (
  categoryGroups: CategoryGroup[],
  excludedCategories: ExcludedCategory[]
) => {
  return categoryGroups.reduce((prev, curr) => {
    const excCatsThisGroup = excludedCategories.filter(
      (e) => e.categoryGroupID == curr.groupID
    );
    if (curr.categories.length == excCatsThisGroup.length) return prev;
    if (excCatsThisGroup.length == 0) return [...prev, curr];

    const newCategories = curr.categories.reduce((prev2, curr2) => {
      if (excCatsThisGroup.some((e) => e.guid == curr2.guid)) {
        return prev2;
      }
      return [...prev2, curr2];
    }, [] as Category[]);

    return [
      ...prev,
      {
        ...curr,
        categories: newCategories,
      },
    ];
  }, [] as CategoryGroup[]);
};

/** Returns a filtered CategoryGroup[] which only includes group that have categories with at least
 *  some amount entered by the user */
export const getCategoryGroupsWithAmounts = (
  categoryGroups: CategoryGroup[]
) => {
  return categoryGroups.filter((grp) => grp.adjustedAmountPlusExtra > 0);
};

export const getAllCategories = (
  categoryGroups: CategoryGroup[],
  includeOnChartAdded: boolean
) => {
  return categoryGroups.reduce((prev, curr) => {
    if (!includeOnChartAdded) {
      return [
        ...prev,
        ...curr.categories.filter(
          (c) =>
            c.regularExpenseDetails == null ||
            c.regularExpenseDetails.includeOnChart
        ),
      ];
    }
    return [...prev, ...curr.categories];
  }, [] as Category[]);
};

export const getTotalAmountUsed = (
  categoryGroups: CategoryGroup[],
  includeOnChartAdded: boolean
) => {
  return sum(
    getAllCategories(categoryGroups, includeOnChartAdded),
    "adjustedAmountPlusExtra"
  );
};

export const getGroupAmounts = (
  categories: Category[],
  includeOnChartAdded: boolean
) => {
  return categories.reduce(
    (prev, curr) => {
      if (
        !includeOnChartAdded &&
        curr.regularExpenseDetails != null &&
        !curr.regularExpenseDetails.includeOnChart
      ) {
        return prev;
      }

      return {
        amount: prev.amount + curr.amount,
        extraAmount: prev.extraAmount + curr.extraAmount,
        adjustedAmount: prev.adjustedAmount + curr.adjustedAmount,
        adjustedAmountPlusExtra:
          prev.adjustedAmountPlusExtra + curr.adjustedAmountPlusExtra,
      };
    },
    {
      amount: 0,
      extraAmount: 0,
      adjustedAmount: 0,
      adjustedAmountPlusExtra: 0,
    }
  );
};

export const getPercentIncome = (
  monthlyIncome: number,
  categoryGroup: CategoryGroup | Category
) => {
  if (monthlyIncome == 0) return 0;
  return categoryGroup.adjustedAmountPlusExtra / monthlyIncome;
};

export const isRegularExpense = (category: Category) => {
  return category.regularExpenseDetails != null;
};

export const getRegularExpenses = (categoryGroups: CategoryGroup[]) => {
  return categoryGroups.reduce((prev, curr) => {
    const expenseCats = curr.categories.filter(
      (c) => isRegularExpense(c) && c.regularExpenseDetails?.includeOnChart
    );
    if (expenseCats.length == 0) return prev;
    return [
      ...prev,
      {
        ...curr,
        categories: expenseCats,
      },
    ];
  }, [] as CategoryGroup[]);
};

export const getNumExpensesWithTargetMet = (
  categoryGroups: CategoryGroup[],
  monthsAheadTarget: number,
  budget: Budget,
  userData: UserData
) => {
  return getAllCategories(categoryGroups, false).reduce((prev, curr) => {
    // const calcPostingMonths = getPostingMonths(
    //   curr,
    //   budget.months,
    //   userData.payFrequency,
    //   userData.nextPaydate,
    //   curr.postingMonths.length
    // );
    // if (curr.name == "Phone") {
    //   log("comparing posting months", {
    //     calcPostingMonths,
    //     postingMonths: curr.postingMonths,
    //   });
    // }
    const monthsAhead = curr.postingMonths.filter(
      (pm) => pm?.month !== startOfMonth(new Date()).toISOString()
      // &&
      // calcPostingMonths.find(
      //   (pm2) => pm2.month.substring(0, 10) == pm.month.substring(0, 10)
      // )?.amount == pm.amount
    ).length;
    if (monthsAhead >= monthsAheadTarget) return prev + 1;
    return prev;
  }, 0);
};

export const dueDateAndAmountSet = (
  isMonthly: boolean | undefined,
  nextDueDate: string | undefined,
  categoryAmount: number,
  budgetCategory: BudgetMonthCategory,
  currMonth: Date
) => {
  // We have a non-monthly regular expense, we've posted an amount
  // to this category AND not only is the month we posted to the same
  // as this category's next due date, but the amount available on
  // this budget category has reached the expected "category.amount",
  // so this check will allow us to re-calculate accordingly.
  if (isMonthly == undefined || isMonthly) return false;
  const dtNextDueDate = parseISO(nextDueDate as string);
  return (
    startOfMonth(dtNextDueDate) == currMonth &&
    budgetCategory.available >= categoryAmount
  );
};

// Upcoming Expenses functions
export const isUpcomingExpense = (category: Category) => {
  return category.upcomingDetails != null;
};

export const getUpcomingCategories = (
  budget: Budget,
  categoryGroups: CategoryGroup[],
  payFrequency: PayFrequency,
  nextPaydate: string
) => {
  const upcomingCategories = getAllCategories(categoryGroups, false).filter(
    (cat) => isUpcomingExpense(cat)
  );
  if (upcomingCategories.length == 0) return [];

  return upcomingCategories
    .map(
      (cat) =>
        calculateUpcomingExpense(
          budget,
          cat,
          payFrequency,
          nextPaydate
        ) as UpcomingExpenseDetails
    )
    .sort((a, b) => a.daysAway - b.daysAway);
};

export const calculateUpcomingExpense = (
  budget: Budget,
  category: Category,
  payFrequency: PayFrequency,
  nextPaydate: string
): UpcomingExpenseDetails | null => {
  if (!isUpcomingExpense(category)) return null;
  const totalAmt =
    category.adjustedAmountPlusExtra > 0
      ? category.upcomingDetails?.expenseAmount || 0
      : 0;
  const bc = getBudgetCategory(
    getBudgetMonth(budget.months, new Date()),
    category.categoryGroupID,
    category.categoryID
  );
  const availableAmt = bc.available;

  if (availableAmt >= totalAmt) {
    return {
      guid: category.guid,
      categoryName: category.name,
      purchaseDate: new Date().toISOString(),
      daysAway: 0,
      paychecksAway: 0,
      amountSaved: availableAmt,
      totalAmount: totalAmt,
    };
  }

  const neededToSave = totalAmt - availableAmt;
  const amtSavedPerPaycheck = getAmountByPayFrequency(
    category.adjustedAmountPlusExtra,
    payFrequency
  );

  log("  ", { neededToSave, amtSavedPerPaycheck, availableAmt });

  const numPaychecks = Math.ceil(neededToSave / amtSavedPerPaycheck);
  const dtCurrPaydate = parseISO(nextPaydate);
  const todayIsPayday = isSameDay(dtCurrPaydate, new Date());

  log("  ", { numPaychecks, dtCurrPaydate });
  let dtUpcomingPaydate = new Date();
  if (payFrequency == "Weekly") {
    dtUpcomingPaydate = addWeeks(
      dtCurrPaydate,
      numPaychecks - (todayIsPayday ? 0 : 1)
    );
  } else if (payFrequency == "Every 2 Weeks") {
    dtUpcomingPaydate = addWeeks(
      dtCurrPaydate,
      (numPaychecks - (todayIsPayday ? 0 : 1)) * 2
    );
  } else if (payFrequency == "Monthly") {
    dtUpcomingPaydate = addMonths(
      dtCurrPaydate,
      numPaychecks - (todayIsPayday ? 0 : 1)
    );
  }

  log("  ", { dtUpcomingPaydate });

  const daysAway = differenceInDays(dtUpcomingPaydate, new Date());

  log("  ", { daysAway });
  return {
    guid: category.guid,
    categoryName: category.name,
    purchaseDate: dtUpcomingPaydate.toISOString(),
    daysAway: daysAway,
    paychecksAway: numPaychecks,
    amountSaved: availableAmt,
    totalAmount: totalAmt,
  };
};
