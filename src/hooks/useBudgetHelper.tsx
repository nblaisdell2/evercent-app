import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Category,
  CategoryGroup,
  ExcludedCategory,
  createCategory,
  getGroupAmounts,
  toggleCategoryOptions,
  updateCategoryAmount,
  updateCategoryData,
  updateCategoryExpenseDetails,
} from "../model/category";
import { CheckboxItem } from "../components/elements/HierarchyTable";
import useHierarchyTable from "./useHierarchyTable";
import { useSQLMutation } from "./useSQLMutation";
import { EvercentData } from "../model/evercent";
import { log } from "../utils/log";
import { find } from "../utils/util";
import { Budget, BudgetMonth, getBudgetMonth } from "../model/budget";
import { PayFrequency, UserData } from "../model/userData";
import { WidgetProps } from "../components/MainContent";
import useEvercent from "./useEvercent";

export type BudgetHelperState = {
  categoryList: CategoryGroup[];
  selectedCategory: Category | undefined;
  categoryListData: CheckboxItem[];
  expandedItems: CheckboxItem[];
  setCategoryListData: Dispatch<SetStateAction<CheckboxItem[]>>;
  setExpandedItems: Dispatch<SetStateAction<CheckboxItem[]>>;
  setSelectedCategory: Dispatch<SetStateAction<Category | undefined>>;

  updateSelectedCategoryAmount: (
    category: Category,
    key: "amount" | "extraAmount",
    newAmount: number
  ) => void;
  toggleSelectedCategoryOptions: (
    category: Category,
    checked: boolean,
    option: string
  ) => void;
  updateSelectedCategoryExpense: (
    category: Category,
    key:
      | "nextDueDate"
      | "isMonthly"
      | "repeatFreqNum"
      | "repeatFreqType"
      | "includeOnChart"
      | "multipleTransactions",
    value: any
  ) => void;
  updateSelectedCategoryUpcomingAmount: (
    category: Category,
    newAmount: number
  ) => void;
  saveCategories: () => void;
  updateExcludedCategories: (itemsToUpdate: CheckboxItem[]) => void;
  // discardChanges: () => void;
};

function useBudgetHelper(widgetProps: WidgetProps | undefined) {
  const {
    userData,
    budget,
    categoryGroups,
    categoryGroupsAll,
    excludedCategories,
  } = useEvercent();

  const [categoryList, setCategoryList] = useState<CategoryGroup[]>([
    ...categoryGroups,
  ]);
  const [excludedList, setExcludedList] = useState<ExcludedCategory[]>([
    ...excludedCategories,
  ]);

  const [selectedCategory, setSelectedCategory] = useState<Category>();

  const {
    mutate: updateCategories,
    data: newCategoryData,
    error,
    mutError,
  } = useSQLMutation<EvercentData, any>(
    ["update-categories"],
    updateCategoryData(
      userData?.userID as string,
      userData?.budgetID as string,
      categoryList as CategoryGroup[],
      excludedList as ExcludedCategory[]
    ),
    ["get-all-evercent-data"],
    false,
    (old: EvercentData | undefined) => {
      if (old && categoryList && excludedList) {
        log("updating cache", { categoryList, excludedList });
        return {
          ...old,
          categoryGroups: categoryList,
          excludedCategories: excludedList,
        };
      }
    }
  );

  const updateSelectedCategoryAmount = (
    category: Category,
    key: "amount" | "extraAmount",
    newAmount: number
  ) => {
    const newCategory = updateCategoryAmount(
      budget as Budget,
      category,
      userData?.payFrequency as PayFrequency,
      userData?.nextPaydate as string,
      key,
      newAmount
    );
    updateSelectedCategory(newCategory);
  };

  const updateSelectedCategoryExpense = (
    category: Category,
    key:
      | "nextDueDate"
      | "isMonthly"
      | "repeatFreqNum"
      | "repeatFreqType"
      | "includeOnChart"
      | "multipleTransactions",
    value: any
  ) => {
    const newCategory = updateCategoryExpenseDetails(
      budget as Budget,
      category,
      userData?.payFrequency as PayFrequency,
      userData?.nextPaydate as string,
      key,
      value
    );
    updateSelectedCategory(newCategory);
  };

  const toggleSelectedCategoryOptions = (
    category: Category,
    checked: boolean,
    option: string
  ) => {
    const newCategory = toggleCategoryOptions(
      userData as UserData,
      budget as Budget,
      category,
      checked,
      option
    );
    updateSelectedCategory(newCategory);
  };

  const updateSelectedCategoryUpcomingAmount = (
    category: Category,
    newAmount: number
  ) => {
    if (category.upcomingDetails) {
      const newCategory = {
        ...category,
        upcomingDetails: {
          ...category.upcomingDetails,
          expenseAmount: newAmount,
        },
      };
      updateSelectedCategory(newCategory);
    }
  };

  const updateSelectedCategory = (newCategory: Category | undefined) => {
    if (categoryList) {
      if (newCategory) {
        let newCategoryList = [...categoryList];
        const groupIdx = newCategoryList.findIndex((grp) => {
          return grp.groupName == newCategory.groupName;
        });
        const catIdx =
          newCategoryList[groupIdx].categories?.findIndex((cat) => {
            return cat.name == newCategory.name;
          }) || 0;
        let newCats = newCategoryList[groupIdx].categories
          ? [...newCategoryList[groupIdx].categories]
          : [];

        newCats[catIdx] = { ...newCats[catIdx], ...newCategory };
        newCategoryList[groupIdx] = {
          ...newCategoryList[groupIdx],
          categories: newCats,
          ...getGroupAmounts(newCats, false),
        };

        // log("new Group", {
        //   group: newCategoryList[groupIdx],
        //   cats: newCats,
        //   grpAmounts: getGroupAmounts(newCats),
        // });

        setCategoryList(newCategoryList);
        updateChangesMade(true);
      }

      setSelectedCategory(newCategory);
    }
  };

  const updateChangesMade = (newVal: boolean) => {
    if (widgetProps?.setWidgetMadeChanges) {
      widgetProps.setWidgetMadeChanges(newVal);
    }
  };

  const updateExcludedCategories = (itemsToUpdate: CheckboxItem[]) => {
    // log("[useBH - saveExcludedCategories] // itemsToUpdate", {
    //   itemsToUpdate,
    //   categoryList,
    // });

    let newExcluded: ExcludedCategory[] = [];
    let newCategories = [...categoryList];
    itemsToUpdate.forEach((item) => {
      let itemGroup = find(
        newCategories,
        (c) => c.groupID.toLowerCase() == item.parentId.toLowerCase()
      );

      const idx = itemGroup.categories.findIndex(
        (c) => c.categoryID.toLowerCase() == item.id.toLowerCase()
      );
      if (item.selected) {
        if (idx == -1) {
          // Add to category list, if not already included
          const newCat = createCategory(
            budget as Budget,
            [...categoryGroupsAll] as CategoryGroup[],
            item.parentId,
            item.id
          );
          // log("Adding new category", newCat);

          const budgetGroup = find(
            getBudgetMonth(budget?.months as BudgetMonth[], new Date()).groups,
            (g) =>
              g.categoryGroupID.toLowerCase() == itemGroup.groupID.toLowerCase()
          );

          const budCatIdx = budgetGroup.categories.findIndex(
            (c) => c.categoryID.toLowerCase() == newCat.categoryID.toLowerCase()
          );

          itemGroup.categories.splice(budCatIdx, 0, newCat);
        }
      } else {
        // Remove from category list, if already included
        if (idx != -1) {
          // log("Removing category from list");
          newExcluded.push({
            guid: itemGroup.categories[idx].guid,
            categoryGroupID: item.parentId,
            categoryID: item.id,
          });
          itemGroup.categories.splice(idx, 1);

          // Re-calculate group amounts since a category was removed
          const amts = getGroupAmounts(itemGroup.categories, false);
          itemGroup.amount = amts.amount;
          itemGroup.extraAmount = amts.extraAmount;
          itemGroup.adjustedAmount = amts.adjustedAmount;
          itemGroup.adjustedAmountPlusExtra = amts.adjustedAmountPlusExtra;
        }
      }
    });

    // log("setting new categories", newCategories);
    setCategoryList(() => newCategories);
    setExcludedList(() => newExcluded);

    updateChangesMade(true);
  };

  const saveCategories = () => {
    // save the category list results to the database
    updateCategories();

    updateSelectedCategory(undefined);
    updateChangesMade(false);
  };

  useEffect(() => {
    updateChangesMade(false);

    if (widgetProps) {
      widgetProps.setOnSaveFn(() => saveCategories);
    }
  }, []);

  // if (error) log("mutation error", mutError);

  return {
    categoryList,
    selectedCategory,
    setSelectedCategory,

    updateSelectedCategoryAmount,
    toggleSelectedCategoryOptions,
    updateSelectedCategoryExpense,
    updateSelectedCategoryUpcomingAmount,
    saveCategories,
    updateExcludedCategories,
  } as BudgetHelperState;
}

export default useBudgetHelper;
