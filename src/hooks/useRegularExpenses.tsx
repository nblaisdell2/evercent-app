import { useEffect, useState } from "react";
import { WidgetProps } from "../components/MainContent";
import useEvercent from "./useEvercent";
import {
  Category,
  CategoryGroup,
  PostingMonth,
  getAllCategories,
  getPostingMonths,
  getRegularExpenses,
} from "../model/category";
import {
  Budget,
  BudgetMonth,
  getTotalAvailableInBudget,
  getTotalBudgetedByMonth,
  getTotalBudgetedByMonthRegular,
} from "../model/budget";
import { PayFrequency, UserData } from "../model/userData";
import useHierarchyTable, { HierarchyTableState } from "./useHierarchyTable";
import { log } from "../utils/log";
import { CheckboxItem } from "../components/elements/HierarchyTable";
import { find } from "../utils/util";
import { getAutoRunPostingMonths } from "../model/autoRun";

export type RegularExpenseBudgetAmounts = {
  totalAvailable: number;
  amountUsed: number;
  amountRemaining: number;
};

type RegularExpensePostingStatus = "prep" | "posting" | null;

export type RegularExpensePostingDetails = {
  status: RegularExpensePostingStatus;
  progress: number;
  category: {
    categoryName: string | null;
    month: string | null;
    amount: number | null;
  };
};

export type RegularExpensesState = {
  regularExpenses: CategoryGroup[];
  budgetAmounts: RegularExpenseBudgetAmounts;
  budgetAvailableAmountTotal: number;
  totalBudgetedByMonth: PostingMonth[];
  monthsAhead: number;
  updateMonthsAhead: (newTarget: number) => Promise<void>;
  postingDetails: RegularExpensePostingDetails;
  startResetProgress: () => void;
  undoResetProgress: () => void;
  postCategoryAmountsToBudget: () => Promise<void>;
  updateMonthsAheadForCategory: (
    categoryID: string,
    increment: boolean
  ) => void;
  regularExpensesTableData: HierarchyTableState;
  getPostingMonthsForGroup: (groupID: string) => PostingMonth[];
  getPostingMonthsForCategory: (
    groupID: string,
    categoryID: string
  ) => PostingMonth[];
};

function useRegularExpenses(widgetProps: WidgetProps) {
  const {
    userData,
    budget,
    categoryGroups,
    updateBudgetCategoryAmount,
    updateMonthsAhead,
  } = useEvercent();

  const [regularExpenses, setRegularExpenses] = useState(
    getRegularExpenses(categoryGroups)
  );

  const [monthsAhead, setMonthsAhead] = useState(
    userData?.monthsAheadTarget || 6
  );

  const [budgetAmounts, setBudgetAmounts] =
    useState<RegularExpenseBudgetAmounts>({
      totalAvailable: 0,
      amountUsed: 0,
      amountRemaining: 0,
    });

  const [postingDetails, setPostingDetails] =
    useState<RegularExpensePostingDetails>({
      status: null,
      progress: 0,
      category: {
        categoryName: null,
        month: null,
        amount: null,
      },
    });

  const [monthMapCategory, setMonthMapCategory] = useState(
    new Map<string, PostingMonth[]>()
  );
  const [monthMapGroup, setMonthMapGroup] = useState(
    new Map<string, PostingMonth[]>()
  );

  const startResetProgress = () => {
    const amtAvailable = getTotalAvailableInBudget(budget as Budget);
    // console.log("TOTAL AMOUNT AVAILABLE: " + amtAvailable);

    setBudgetAmounts({
      totalAvailable: amtAvailable,
      amountUsed: 0,
      amountRemaining: amtAvailable,
    });

    hierarchyTableData.setListData(createList2());
    monthMapCategory.forEach((v, k) => {
      monthMapCategory.set(k, []);
    });
    monthMapGroup.forEach((v, k) => {
      monthMapGroup.set(k, []);
    });
    // monthMapGroup.clear();
    // monthMapCategory.clear();

    // // Set all of the categories to have 0 months ahead when resetting progress.
    // setRegularExpenseDetails({
    //   ...regularExpenseDetails,
    //   regularExpenses: regularExpenseDetails.regularExpenses.map((re) => {
    //     return {
    //       ...re,
    //       totalSaved: 0,
    //       categories: re.categories.map((c: RegularExpenseCategory) => {
    //         return {
    //           ...c,
    //           totalSaved: 0,
    //           monthsAhead: 0,
    //           savedAmounts: [],
    //         };
    //       }),
    //     };
    //   }),
    //   numExpensesWithTargetMet: 0,
    // });

    setPostingDetails({ ...postingDetails, status: "prep" });
  };

  const undoResetProgress = () => {
    setPostingDetails({ ...postingDetails, status: null });
  };

  const postCategoryAmountsToBudget = async () => {
    setPostingDetails({ ...postingDetails, status: "posting" });

    console.log("Regular Expenses for posting", regularExpenses);

    monthMapCategory.forEach(async (v, k) => {
      const catID = k;
      const months = v;

      months.forEach(async (v) => {
        // Loop through each of the new regular expenses, based on the user's
        // newly entered months ahead for each category, and post the amounts
        // to the user's actual budget
        await updateBudgetCategoryAmount({
          userID: userData?.userID as string,
          budgetID: userData?.budgetID as string,
          categoryID: catID.toLowerCase(),
          month: v.month,
          newBudgetedAmount: v.amount,
        });
      });
    });

    // setRegularExpenseDetails({
    //   ...regularExpenseDetails,
    //   regularExpenses: newRegExpenses,
    //   amountsPerMonth: getMonthAmounts(newRegExpenses),
    //   totalSaved: newRegExpenses.reduce((prev, curr) => {
    //     return prev + curr.totalSaved;
    //   }, 0),
    //   numExpensesWithTargetMet: numExpensesMetTarget,
    // });

    setPostingDetails({ ...postingDetails, status: null });
  };

  const updateMonthsAheadForCategory = (
    categoryID: string,
    increment: boolean
  ) => {
    let currMonths = monthMapCategory.get(categoryID) || [];
    const group = find(regularExpenses, (cg) =>
      cg.categories.some(
        (c) => c.categoryID.toLowerCase() == categoryID.toLowerCase()
      )
    );
    const category = find(
      group.categories,
      (c) => c.categoryID.toLowerCase() == categoryID.toLowerCase()
    );
    const calculated = getPostingMonths(
      category,
      budget?.months as BudgetMonth[],
      userData?.payFrequency as PayFrequency,
      userData?.nextPaydate as string,
      currMonths.length + 1
    );
    log("increment/decrement", {
      increment,
      monthMapCategory,
      monthMapGroup,
      calculated,
    });

    if (currMonths.length == 0 && !increment) return;

    if (increment) {
      currMonths = [...calculated];
    } else {
      currMonths.splice(currMonths.length - 1, 1);
    }

    monthMapCategory.set(categoryID, currMonths);

    let newGroupMonths: any = {};
    monthMapCategory.forEach((v, k) => {
      const catID = k;
      const months = v;

      months.forEach((m) => {
        if (!Object.keys(newGroupMonths).includes(m.month)) {
          newGroupMonths[m.month] = 0;
        }
        newGroupMonths[m.month] += m.amount;
      });
    });

    const keys = Object.keys(newGroupMonths);
    const newGroupPostingMonths = keys.map((k) => {
      return {
        amount: newGroupMonths[k],
        month: k.substring(0, 10),
        percent: 0,
      } as PostingMonth;
    });
    log("newGroupMonths", newGroupPostingMonths);
    monthMapGroup.set(group.groupID, newGroupPostingMonths);

    hierarchyTableData.setListData(createList2());

    // let newBudgetAmounts = { ...budgetAmounts };
    // let newRegExpenses = [...regularExpenseDetails.regularExpenses];
    // let groupIdx = newRegExpenses.findIndex((g) =>
    //   g.categories.find((c) => c.categoryID == category.categoryID)
    // );
    // let grp = newRegExpenses[groupIdx];
    // let newCategories = [...grp.categories];
    // let catIdx = newCategories.findIndex(
    //   (c) => c.categoryID == category.categoryID
    // );
    // let newSavedAmounts = [...newCategories[catIdx].savedAmounts];
    // if (!increment && newSavedAmounts.length == 0) {
    //   return;
    // }
    // let newAmt = 0;
    // if (!increment) {
    //   newAmt = -newSavedAmounts[newSavedAmounts.length - 1].amount;
    //   newSavedAmounts = newSavedAmounts.slice(0, newSavedAmounts.length - 1);
    // } else {
    //   let dtMonth = new Date();
    //   if (
    //     newSavedAmounts.length == 0 &&
    //     (category.regularExpenseDetails.multipleTransactions ||
    //       (!category.regularExpenseDetails.multipleTransactions &&
    //         category.budgetAmounts.activity == 0))
    //   ) {
    //     dtMonth = parseDate();
    //     dtMonth = getFirstOfMonth(dtMonth);
    //   } else {
    //     // Get the last month entered, and add one month to it
    //     let lastMonth = "";
    //     if (newSavedAmounts.length > 0) {
    //       lastMonth = newSavedAmounts[newSavedAmounts.length - 1].month;
    //     } else {
    //       lastMonth = getFirstOfMonth(parseDate(getDate_Today())).toISOString();
    //     }
    //     dtMonth = addMonths(parseDate(lastMonth), 1);
    //     dtMonth = getFirstOfMonth(dtMonth);
    //   }
    //   newAmt = getAmountForFutureMonth(category, dtMonth);
    //   newAmt = addExtraPenny(newAmt);
    //   // newAmt = category.adjustedAmt;
    //   newSavedAmounts.push({
    //     month: dtMonth.toISOString(),
    //     amount: newAmt,
    //     percentAmount: 0,
    //   });
    // }
    // newBudgetAmounts.amountUsed += newAmt;
    // newBudgetAmounts.amountRemaining -= newAmt;
    // newCategories[catIdx] = {
    //   ...newCategories[catIdx],
    //   savedAmounts: newSavedAmounts,
    //   totalSaved: newCategories[catIdx].totalSaved + newAmt,
    //   monthsAhead: newSavedAmounts.filter(
    //     (pm) =>
    //       pm.month !== getFirstOfMonth(parseDate(getDate_Today())).toISOString()
    //   ).length,
    // };
    // newRegExpenses[groupIdx] = {
    //   ...newRegExpenses[groupIdx],
    //   categories: newCategories,
    //   totalSaved: newRegExpenses[groupIdx].totalSaved + newAmt,
    // };
    // setRegularExpenseDetails({
    //   ...regularExpenseDetails,
    //   regularExpenses: newRegExpenses,
    // });
    // setBudgetAmounts(newBudgetAmounts);
  };

  const updateMonthsAheadTarget = async (newTarget: number) => {
    widgetProps.setOnSaveFn(async () => {
      widgetProps.setModalIsSaving(true);
      await updateMonthsAhead({
        userData: userData as UserData,
        newTarget,
      });
      widgetProps.setModalIsSaving(false);

      setMonthsAhead(newTarget);
    });

    // const numExpensesMetTarget = regularExpenseDetails.regularExpenses.reduce(
    //   (prev1, re) => {
    //     return (
    //       prev1 +
    //       re.categories.reduce((prev, c: RegularExpenseCategory) => {
    //         const newSavedAmounts = [
    //           ...c.savedAmounts.filter(
    //             (pm) =>
    //               pm.month !==
    //               getFirstOfMonth(parseDate(getDate_Today())).toISOString()
    //           ),
    //         ];
    //         if (newSavedAmounts.length >= newTarget) {
    //           return prev + 1;
    //         }

    //         return prev;
    //       }, 0)
    //     );
    //   },
    //   0
    // );

    // setRegularExpenseDetails({
    //   ...regularExpenseDetails,
    //   numExpensesWithTargetMet: numExpensesMetTarget,
    // });
  };

  const getPostingMonthsForGroup = (groupID: string) => {
    // log("getting post amounts for group", { groupID, postingDetails });
    if (postingDetails.status != "prep") {
      return getTotalBudgetedByMonthRegular(
        regularExpenses,
        budget as Budget,
        groupID
      );
    } else {
      return monthMapGroup.get(groupID) || [];
    }
  };

  const getPostingMonthsForCategory = (groupID: string, categoryID: string) => {
    // log("getting post amounts for category", { categoryID, postingDetails });
    if (postingDetails.status != "prep") {
      return getTotalBudgetedByMonthRegular(
        regularExpenses,
        budget as Budget,
        groupID,
        categoryID
      );
    } else {
      return monthMapCategory.get(categoryID) || [];
    }
  };

  const createList = (data: any) => {
    const regExpenses: CategoryGroup[] = data;
    const list: CheckboxItem[] = [];

    for (let i = 0; i < regExpenses.length; i++) {
      const grp = regExpenses[i];
      list.push({
        parentId: "",
        id: grp.groupID,
        name: grp.groupName,
        expanded: true,
      });

      for (let j = 0; j < grp.categories.length; j++) {
        const cat = grp.categories[j];
        list.push({
          parentId: grp.groupID,
          id: cat.categoryID,
          name: cat.name,
          expanded: true,
        });

        const amountsSaved = getPostingMonthsForCategory(
          grp.groupID,
          cat.categoryID
        );
        for (let k = 0; k < amountsSaved.length; k++) {
          list.push({
            parentId: cat.categoryID,
            id: amountsSaved[k].month,
            name: amountsSaved[k].month,
          });
        }
      }
    }

    return list;
  };

  const createList2 = () => {
    const list: CheckboxItem[] = [];

    for (let i = 0; i < regularExpenses.length; i++) {
      const grp = regularExpenses[i];
      list.push({
        parentId: "",
        id: grp.groupID,
        name: grp.groupName,
        expanded: true,
      });

      for (let j = 0; j < grp.categories.length; j++) {
        const cat = grp.categories[j];
        list.push({
          parentId: grp.groupID,
          id: cat.categoryID,
          name: cat.name,
          expanded: true,
        });

        // const amountsSaved = getPostingMonthsForCategory(
        //   grp.groupID,
        //   cat.categoryID
        // );
        // for (let k = 0; k < amountsSaved.length; k++) {
        //   list.push({
        //     parentId: cat.categoryID,
        //     id: amountsSaved[k].month,
        //     name: amountsSaved[k].month,
        //   });
        // }
      }
    }

    return list;
  };

  useEffect(() => {
    if (postingDetails.status == null) {
      regularExpenses.forEach((cg) => {
        cg.categories.forEach((c) => {
          monthMapCategory.set(
            c.categoryID,
            getTotalBudgetedByMonthRegular(
              regularExpenses,
              budget as Budget,
              cg.groupID,
              c.categoryID
            )
          );
        });

        monthMapGroup.set(
          cg.groupID,
          getTotalBudgetedByMonthRegular(
            regularExpenses,
            budget as Budget,
            cg.groupID
          )
        );
      });

      hierarchyTableData.setListData(createList(regularExpenses));
    }
  }, [postingDetails.status]);

  const hierarchyTableData = useHierarchyTable(regularExpenses, createList);
  log("maps", { monthMapCategory, monthMapGroup });

  return {
    regularExpenses,
    budgetAmounts,
    budgetAvailableAmountTotal: getTotalAvailableInBudget(budget as Budget),
    totalBudgetedByMonth: getTotalBudgetedByMonth(budget as Budget),
    monthsAhead,
    updateMonthsAhead: updateMonthsAheadTarget,
    postingDetails,
    startResetProgress,
    undoResetProgress,
    postCategoryAmountsToBudget,
    updateMonthsAheadForCategory,
    regularExpensesTableData: hierarchyTableData,
    getPostingMonthsForGroup,
    getPostingMonthsForCategory,
  } as RegularExpensesState;
}

export default useRegularExpenses;
