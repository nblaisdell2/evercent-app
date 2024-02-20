import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { WidgetProps } from "../components/MainContent";
import useEvercent, { Queries } from "./useEvercent";
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
  getBudgetCategory,
  getBudgetMonth,
  getTotalAvailableInBudget,
  getTotalBudgetedByMonth,
  getTotalBudgetedByMonthRegular,
} from "../model/budget";
import { PayFrequency, UserData } from "../model/userData";
import useHierarchyTable, { HierarchyTableState } from "./useHierarchyTable";
import { log } from "../utils/log";
import { CheckboxItem } from "../components/elements/HierarchyTable";
import { getDistinctValues, sleep, sum } from "../utils/util";
import { useQueryClient } from "@tanstack/react-query";
import { EvercentData } from "../model/evercent";
import { isSameMonth, parseISO } from "date-fns";

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
  updateMonthsAheadForCategory: (
    category: Category,
    increment: boolean
  ) => void;
  postCategoryAmountsToBudget: () => Promise<void>;
  regularExpensesTableData: HierarchyTableState;
  setExpandedGroups: Dispatch<SetStateAction<string[]>>;
  setExpandedCategories: Dispatch<SetStateAction<string[]>>;
  getPostingMonthsForGroup: (grp: CategoryGroup) => PostingMonth[];
  getPostingMonthsForCategory: (category: Category) => PostingMonth[];
};

function useRegularExpenses(widgetProps: WidgetProps) {
  const {
    userData,
    budget,
    categoryGroups,
    updateBudgetCategoryAmount,
    updateMonthsAhead,
  } = useEvercent();

  const queryClient = useQueryClient();

  const [regularExpenses, setRegularExpenses] = useState(
    getPostingMonthsBudgeted(getRegularExpenses(categoryGroups))
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
  };

  const resetRegularExpenses = (newRegularExpenses: CategoryGroup[]) => {
    setRegularExpenses(newRegularExpenses);
    hierarchyTableData.setListData(createList(newRegularExpenses));
  };

  const startResetProgress = () => {
    setPostingDetails({ ...postingDetails, status: "prep" });

    const amtAvailable = getTotalAvailableInBudget(budget as Budget);

    setBudgetAmounts({
      totalAvailable: amtAvailable,
      amountUsed: 0,
      amountRemaining: amtAvailable,
    });

    const newRegularExpenses = getPostingMonthsEmpty(regularExpenses);
    resetRegularExpenses(newRegularExpenses);
  };

  const undoResetProgress = () => {
    setPostingDetails({ ...postingDetails, status: null });

    resetRegularExpenses(
      getPostingMonthsBudgeted(getRegularExpenses(categoryGroups))
    );
  };

  const postCategoryAmountsToBudget = async () => {
    setPostingDetails((prev) => {
      return {
        status: "posting",
        category: prev.category,
        progress: prev.progress,
      };
    });

    console.log("Regular Expenses for posting", regularExpenses);

    const categoriesToPost = getAllCategories(regularExpenses, false);
    const numMonthsToPost = categoriesToPost.reduce((prev, curr) => {
      return [...prev, ...curr.postingMonths];
    }, [] as PostingMonth[]).length;

    type NewPostingMonth = PostingMonth & {
      categoryName: string;
      categoryID: string;
    };

    let newMonths: NewPostingMonth[] = [];
    const budgetMonths = (budget as Budget).months;
    for (let i = 0; i < budgetMonths.length; i++) {
      const bm = budgetMonths[i];

      const monthTotalAvailable = sum(bm.groups, "available");
      if (monthTotalAvailable > 0) {
        for (let j = 0; j < bm.groups.length; j++) {
          const budGroup = bm.groups[j];

          if (budGroup.available > 0) {
            for (let k = 0; k < budGroup.categories.length; k++) {
              const budCat = budGroup.categories[k];

              if (i == 0 && budCat.available > 0) {
                newMonths.push({
                  month: bm.month,
                  amount: -budCat.available + budCat.budgeted,
                  percent: 0,
                  categoryID: budCat.categoryID,
                  categoryName: budCat.name,
                });
                budCat.budgeted = -budCat.available + budCat.budgeted;
              } else if (i != 0 && budCat.budgeted > 0) {
                newMonths.push({
                  month: bm.month,
                  amount: 0,
                  percent: 0,
                  categoryID: budCat.categoryID,
                  categoryName: budCat.name,
                });
                budCat.budgeted = 0;
              }
            }
          }
        }
      }
    }

    log("newMonths?", { newMonths });

    for (let j = 0; j < newMonths.length; j++) {
      const pm = newMonths[j];

      setPostingDetails((prev) => {
        return {
          status: "posting",
          category: {
            categoryName: pm.categoryName,
            amount: pm.amount < 0 ? 0 : pm.amount,
            month: pm.month,
          },
          progress: j / (newMonths.length + numMonthsToPost),
        };
      });
      await sleep(1500);

      // Loop through each of the new regular expenses, based on the user's
      // newly entered months ahead for each category, and post the amounts
      // to the user's actual budget
      await updateBudgetCategoryAmount({
        userID: userData?.userID as string,
        budgetID: userData?.budgetID as string,
        categoryID: pm.categoryID.toLowerCase(),
        month: pm.month,
        newBudgetedAmount: pm.amount,
      });
    }

    // // TODO: We need to empty out the budget amounts for all other categories,
    // //       even if the user didn't select them, so that the rest of the money
    // //       still ends up in the "To Be Assigned" section in the user's budget

    let idx = -1;
    for (let i = 0; i < categoriesToPost.length; i++) {
      for (let j = 0; j < categoriesToPost[i].postingMonths.length; j++) {
        const pm = categoriesToPost[i].postingMonths[j];
        idx += 1;

        setPostingDetails((prev) => {
          return {
            status: "posting",
            category: {
              categoryName: categoriesToPost[i].name,
              amount: pm.amount,
              month: pm.month,
            },
            progress:
              (newMonths.length + idx) / (newMonths.length + numMonthsToPost),
          };
        });

        if (isSameMonth(parseISO(pm.month), new Date())) {
          const bm = getBudgetMonth(budgetMonths, parseISO(pm.month));
          const bc = getBudgetCategory(
            bm,
            categoriesToPost[i].categoryGroupID,
            categoriesToPost[i].categoryID
          );
          pm.amount += bc.budgeted;
        }

        await sleep(1500);
        // Loop through each of the new regular expenses, based on the user's
        // newly entered months ahead for each category, and post the amounts
        // to the user's actual budget
        log("need to post to budget", {
          userID: userData?.userID as string,
          budgetID: userData?.budgetID as string,
          categoryID: categoriesToPost[i].categoryID.toLowerCase(),
          month: pm.month,
          newBudgetedAmount: pm.amount,
        });
        await updateBudgetCategoryAmount({
          userID: userData?.userID as string,
          budgetID: userData?.budgetID as string,
          categoryID: categoriesToPost[i].categoryID.toLowerCase(),
          month: pm.month,
          newBudgetedAmount: pm.amount,
        });
      }
    }

    // reload all evercent data when finished posting new amounts
    // to user's budget
    await queryClient.invalidateQueries(["get-all-evercent-data"]);

    hierarchyTableData.setListData(
      createList(getPostingMonthsBudgeted(regularExpenses))
    );

    setPostingDetails((prev) => {
      return {
        status: null,
        category: {
          amount: null,
          categoryName: null,
          month: null,
        },
        progress: 0,
      };
    });
  };

  // Once the "postCategoryAmountsToBudget" (above) is completed, the
  // query containing all the evercent data will be invalidated, so we'll
  // reload our regular expenses when we recognize a change in that list
  // of category groups
  useEffect(() => {
    log("regular expenses useEffect");
    const newRegularExpenses = getPostingMonthsBudgeted(
      getRegularExpenses(categoryGroups)
    );
    resetRegularExpenses(newRegularExpenses);
  }, [categoryGroups]);

  const updateMonthsAheadForCategory = (
    category: Category,
    increment: boolean
  ) => {
    let currMonths = category.postingMonths;
    if (currMonths.length == 0 && !increment) return;

    log("getting posting month for inc/dec");
    let calculated = getPostingMonths(
      category,
      budget?.months as BudgetMonth[],
      userData?.payFrequency as PayFrequency,
      new Date().toISOString(),
      currMonths.length + 1
    );
    log("increment/decrement", {
      increment,
      calculated,
    });

    let month: PostingMonth;
    if (increment) {
      if (
        budgetAmounts.amountRemaining -
          calculated[calculated.length - 1].amount <
        0
      ) {
        return;
      }

      currMonths.push(calculated[calculated.length - 1]);
      month = currMonths[currMonths.length - 1];
    } else {
      month = currMonths.splice(currMonths.length - 1, 1)[0];
    }

    setBudgetAmounts((prev) => {
      return {
        totalAvailable: prev.totalAvailable,
        amountUsed:
          prev.amountUsed + (increment ? month.amount : -month.amount),
        amountRemaining:
          prev.amountRemaining + (increment ? -month.amount : month.amount),
      };
    });

    const newRegularExpenses = getPostingMonthsNew(
      regularExpenses,
      category,
      currMonths,
      increment
    );
    resetRegularExpenses(newRegularExpenses);
  };

  const getPostingMonthsForGroup = (grp: CategoryGroup) => {
    // log("getting post amounts for group", { groupID, postingDetails });
    const monthData = grp.categories.reduce((prev, curr) => {
      const catPostMonths = curr.postingMonths;
      catPostMonths.forEach((pm) => {
        if (!Object.keys(prev).includes(pm.month)) {
          prev[pm.month] = 0;
        }
        prev[pm.month] += pm.amount;
      });
      return prev;
    }, {} as { [key: string]: number });
    const sortedKeys = Object.keys(monthData).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    return sortedKeys.map((key) => {
      return {
        month: key,
        amount: monthData[key],
        percent: 0,
      } as PostingMonth;
    });
  };

  const getPostingMonthsForCategory = (category: Category) => {
    let monthData: { [key: string]: number } = {};
    const catPostMonths = category.postingMonths;
    // if (category.name == "Groceries") log({ catPostMonths });
    catPostMonths.forEach((pm) => {
      if (!Object.keys(monthData).includes(pm.month)) {
        monthData[pm.month] = 0;
      }
      monthData[pm.month] += pm.amount;
    });
    const sortedKeys = Object.keys(monthData).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    return sortedKeys.map((key) => {
      return {
        month: key,
        amount: monthData[key],
        percent: 0,
      } as PostingMonth;
    });
  };

  function getPostingMonthsNew(
    regularExpenses: CategoryGroup[],
    category: Category,
    newPostingMonths: PostingMonth[],
    increment: boolean
  ): CategoryGroup[] {
    log("getting new posting months");
    return regularExpenses.map((cg) => {
      const newCategories = cg.categories.map((c) => {
        if (c.categoryID.toLowerCase() != category.categoryID.toLowerCase()) {
          return c;
        }
        return {
          ...c,
          monthsAhead: c.monthsAhead + (increment ? 1 : -1),
          postingMonths: newPostingMonths,
        };
      });
      return {
        ...cg,
        categories: newCategories,
      };
    });
  }

  function getPostingMonthsBudgeted(
    regularExpenses: CategoryGroup[]
  ): CategoryGroup[] {
    return regularExpenses.map((cg, i, arr) => {
      return {
        ...cg,
        categories: cg.categories.map((c) => {
          return {
            ...c,
            // monthsAhead: calculatemon
            postingMonths: getTotalBudgetedByMonthRegular(
              arr,
              budget as Budget,
              cg.groupID,
              c.categoryID
            ),
          };
        }),
      };
    });
  }

  function getPostingMonthsEmpty(
    regularExpenses: CategoryGroup[]
  ): CategoryGroup[] {
    return regularExpenses.map((cg, i, arr) => {
      return {
        ...cg,
        categories: cg.categories.map((c) => {
          return {
            ...c,
            monthsAhead: 0,
            postingMonths: [],
          };
        }),
      };
    });
  }

  const getAllExpandedGroups = () => {
    return getDistinctValues(regularExpenses, "groupID");
  };

  const getAllExpandedCategories = () => {
    return [
      ...new Set(
        regularExpenses.reduce((prev, curr) => {
          return [...prev, ...getDistinctValues(curr.categories, "categoryID")];
        }, [] as string[])
      ),
    ];
  };

  const [expandedGroups, setExpandedGroups] = useState(getAllExpandedGroups());
  const [expandedCategories, setExpandedCategories] = useState(
    getAllExpandedCategories()
  );

  const createList = (data: any) => {
    const regExpenses: CategoryGroup[] = data;
    const list: CheckboxItem[] = [];

    for (let i = 0; i < regExpenses.length; i++) {
      const grp = regExpenses[i];
      list.push({
        parentId: "",
        id: grp.groupID,
        name: grp.groupName,
        data: grp,
        expanded: expandedGroups.includes(grp.groupID),
      });

      for (let j = 0; j < grp.categories.length; j++) {
        const cat = grp.categories[j];
        list.push({
          parentId: grp.groupID,
          id: cat.categoryID,
          name: cat.name,
          data: cat,
          expanded: expandedCategories.includes(cat.categoryID),
        });

        const amountsSaved = cat.postingMonths;
        for (let k = 0; k < amountsSaved.length; k++) {
          list.push({
            parentId: cat.categoryID,
            id: amountsSaved[k].month,
            name: amountsSaved[k].month,
            data: amountsSaved[k],
          });
        }
      }
    }

    return list;
  };

  const hierarchyTableData = useHierarchyTable(
    getPostingMonthsBudgeted(regularExpenses),
    createList
  );
  // log("maps", { monthMapCategory, monthMapGroup });

  return {
    regularExpenses,
    budgetAmounts,
    budgetAvailableAmountTotal: getTotalAvailableInBudget(budget as Budget),
    totalBudgetedByMonth: getTotalBudgetedByMonth(
      budget as Budget,
      regularExpenses
    ),
    monthsAhead,
    updateMonthsAhead: updateMonthsAheadTarget,
    postingDetails,
    startResetProgress,
    undoResetProgress,
    postCategoryAmountsToBudget,
    updateMonthsAheadForCategory,
    regularExpensesTableData: hierarchyTableData,
    setExpandedGroups,
    setExpandedCategories,
    getPostingMonthsForGroup,
    getPostingMonthsForCategory,
  } as RegularExpensesState;
}

export default useRegularExpenses;
