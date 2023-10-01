import React, { useEffect, useState } from "react";
import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";
import CategoryList from "./CategoryList";
import SelectedCategory from "./SelectedCategory";

import useBudgetHelper, {
  BudgetHelperState,
} from "../../../hooks/useBudgetHelper";
import { log } from "../../../utils/log";
import { Budget } from "../../../model/budget";
import { CheckboxItem } from "../../elements/HierarchyTable";
import { CategoryGroup } from "../../../model/category";
import { WidgetProps } from "../../MainContent";
import useEvercent from "../../../hooks/useEvercent";

// TODO: Can we add a callback function to the close modal method
// so that we can run some additional code, optionally, if we want
// when a modal is being closed?

function BudgetHelperFull({ widgetProps }: { widgetProps?: WidgetProps }) {
  log("RENDERING [BudgetHelperFull.tsx]", { widgetProps });
  // log("RENDERING [BudgetHelperFull.tsx]", categoryListData);

  const { userData, budget } = useEvercent();

  const bhProps = useBudgetHelper(widgetProps);
  // const bhProps = useBudgetHelper(monthlyIncome, nextPaydate, categoryGroups);
  log("What are the bhProps", bhProps);

  const {
    categoryList,
    selectedCategory,
    setSelectedCategory,

    updateSelectedCategoryAmount,
    toggleSelectedCategoryOptions,
    updateSelectedCategoryExpense,
    updateSelectedCategoryUpcomingAmount,
    saveCategories,
    updateExcludedCategories,
  } = bhProps;

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

  useEffect(() => {
    setListData(createList(categoryList, expandedItems));
  }, [categoryList]);

  const [expandedItems, setExpandedItems] = useState<CheckboxItem[]>([]);
  const [listData, setListData] = useState<CheckboxItem[]>([]);

  log("category list data", listData);

  return (
    <div className="h-full mx-4 pb-2 flex flex-col">
      <Amounts
        monthlyIncome={userData?.monthlyIncome as number}
        categoryGroups={categoryList}
        type="full"
      />

      <BudgetHelperCharts
        monthlyIncome={userData?.monthlyIncome as number}
        categoryGroups={categoryList}
        type="full"
      />

      {!selectedCategory ? (
        <CategoryList
          budget={budget as Budget}
          monthlyIncome={userData?.monthlyIncome as number}
          categoryGroups={categoryList}
          hierarchyProps={{
            listData,
            expandedItems,
            setExpandedItems,
            setListData,
          }}
          setSelectedCategory={setSelectedCategory}
          updateExcludedCategories={updateExcludedCategories}
          saveCategories={saveCategories}
          changesMade={widgetProps?.widgetMadeChanges || false}
        />
      ) : (
        <SelectedCategory
          nextPaydate={userData?.nextPaydate as string}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          updateSelectedCategoryAmount={updateSelectedCategoryAmount}
          toggleSelectedCategoryOptions={toggleSelectedCategoryOptions}
          updateSelectedCategoryExpense={updateSelectedCategoryExpense}
          updateSelectedCategoryUpcomingAmount={
            updateSelectedCategoryUpcomingAmount
          }
        />
      )}
    </div>
  );
}

export default BudgetHelperFull;
