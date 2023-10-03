import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Category,
  CategoryGroup,
  ExcludedCategory,
  createCategory,
  getGroupAmounts,
  toggleCategoryOptions,
  updateCategoryAmount,
  updateCategoryExpenseDetails,
  updateCategoryUpcomingAmount,
} from "../model/category";
import { CheckboxItem } from "../components/elements/HierarchyTable";
import useHierarchyTable, { HierarchyTableState } from "./useHierarchyTable";
import { log } from "../utils/log";
import { find } from "../utils/util";
import { Budget, BudgetMonth, getBudgetMonth } from "../model/budget";
import { PayFrequency, UserData } from "../model/userData";
import { WidgetProps } from "../components/MainContent";
import useEvercent from "./useEvercent";

export type BudgetHelperState = {
  monthlyIncome: number;
  nextPaydate: string;
  changesMade: boolean;
  categoryList: CategoryGroup[];
  selectedCategory: Category | undefined;
  hierarchyProps: HierarchyTableState;
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
};

function useBudgetHelper(widgetProps: WidgetProps | undefined) {
  const {
    userData,
    budget,
    categoryGroups,
    categoryGroupsAll,
    excludedCategories,
    updateCategories,
  } = useEvercent();

  const [categoryList, setCategoryList] = useState<CategoryGroup[]>([
    ...categoryGroups,
  ]);
  const [excludedList, setExcludedList] = useState<ExcludedCategory[]>([
    ...excludedCategories,
  ]);

  const [selectedCategory, setSelectedCategory] = useState<Category>();

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
      const newCategory = updateCategoryUpcomingAmount(
        budget as Budget,
        category,
        userData?.payFrequency as PayFrequency,
        userData?.nextPaydate as string,
        newAmount
      );
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
    if (widgetProps?.setChangesMade) {
      widgetProps.setChangesMade(newVal);
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

  const saveCategories = async () => {
    if (widgetProps?.setModalIsSaving) {
      widgetProps.setModalIsSaving(true);
    }

    // save the category list results to the database
    await updateCategories({
      userID: userData?.userID as string,
      budgetID: userData?.budgetID as string,
      newCategories: categoryList as CategoryGroup[],
      excludedCategories: excludedList as ExcludedCategory[],
    });

    if (widgetProps?.setModalIsSaving) {
      widgetProps.setModalIsSaving(false);
    }

    updateSelectedCategory(undefined);
    updateChangesMade(false);
  };

  const createList = (
    data: CategoryGroup[],
    expandedItems?: CheckboxItem[]
  ) => {
    // log("Creating collapsible category list", {
    //   data,
    //   expandedItems,
    // });
    if (!data) return [];

    let itemList: CheckboxItem[] = [];
    let currItemGroup: CategoryGroup;
    let currItemCat;
    for (let i = 0; i < data.length; i++) {
      currItemGroup = data[i];
      if (currItemGroup.categories.length > 0) {
        const isExpanded =
          expandedItems &&
          expandedItems.length > 0 &&
          expandedItems.some(
            (e) =>
              e.expanded &&
              e.id.toLowerCase() == currItemGroup.groupID.toLowerCase()
          );
        itemList.push({
          parentId: "",
          id: currItemGroup.groupID,
          name: currItemGroup.groupName,
          expanded: isExpanded,
        });

        for (let j = 0; j < currItemGroup.categories.length; j++) {
          currItemCat = currItemGroup.categories[j];

          itemList.push({
            parentId: currItemGroup.groupID,
            id: currItemCat.categoryID,
            name: currItemCat.name,
          });
        }
      }
    }

    // log("item list", itemList);
    return itemList;
  };

  const hierarchyProps = useHierarchyTable(categoryList, createList);

  useEffect(() => {
    hierarchyProps.setListData(
      createList(categoryList, hierarchyProps.expandedItems)
    );
    if (widgetProps) {
      widgetProps.setOnSaveFn(() => saveCategories);
    }
  }, [categoryList]);

  // if (error) log("mutation error", mutError);

  return {
    monthlyIncome: userData?.monthlyIncome || 0,
    nextPaydate: userData?.nextPaydate || new Date().toISOString(),
    changesMade: widgetProps?.changesMade || false,
    categoryList,
    hierarchyProps,
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
