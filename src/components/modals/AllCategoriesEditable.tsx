import React, { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import Card from "../elements/Card";
import HierarchyTable, { CheckboxItem } from "../elements/HierarchyTable";
import useHierarchyTable, {
  HierarchyTableState,
} from "../../hooks/useHierarchyTable";
import MyButton from "../elements/MyButton";
import {
  Budget,
  BudgetMonthCategory,
  getBudgetCategories,
} from "../../model/budget";
import { log } from "../../utils/log";
import { CategoryGroup, getAllCategories } from "../../model/category";

function AllCategoriesEditable({
  budget,
  categoryGroups,
  closeModal,
  updateExcludedCategories,
}: // editableCategoryList,
{
  budget: Budget;
  categoryGroups: CategoryGroup[];
  closeModal: () => void;
  updateExcludedCategories: (itemsToUpdate: CheckboxItem[]) => void;
  // editableCategoryList: any;
}) {
  const getRowContent = (item: CheckboxItem, indent: number) => {
    switch (indent) {
      case 0:
        return (
          <div
            onClick={() => {
              // toggleCategoryInclusion(item.id);
            }}
            className="flex flex-grow justify-between font-mplus font-extrabold py-[1px] hover:cursor-pointer"
          >
            <div className="flex items-center">
              <div>{item.name}</div>
            </div>
          </div>
        );
      case 1:
        return (
          <div
            onClick={() => {
              // toggleCategoryInclusion(item.id);
            }}
            className={`flex flex-grow justify-between font-mplus py-[1px] hover:cursor-pointer text-sm`}
          >
            <div className="flex items-center">
              <div>{item.name}</div>
            </div>
          </div>
        );
      default:
        return <div></div>;
    }
  };

  const createList = (data: BudgetMonthCategory[]) => {
    if (!data) return [];

    let editableList: CheckboxItem[] = [];
    let currGroup = "";
    let currItem: BudgetMonthCategory;
    const allCategories = getAllCategories(categoryGroups, true);
    for (let i = 0; i < data.length; i++) {
      currItem = data[i];

      if (currItem.categoryGroupID != currGroup) {
        editableList.push({
          parentId: "",
          id: currItem.categoryGroupID,
          name: currItem.categoryGroupName,
          selected: categoryGroups.some(
            (cg) =>
              cg.groupID.toLowerCase() == currItem.categoryGroupID.toLowerCase()
          ),
        });
        currGroup = currItem.categoryGroupID;
      }

      editableList.push({
        parentId: currItem.categoryGroupID,
        id: currItem.categoryID,
        name: currItem.name,
        selected: allCategories.some(
          (c) => c.categoryID.toLowerCase() == currItem.categoryID.toLowerCase()
        ),
      });
    }

    return editableList;
  };

  const onSave = (items: CheckboxItem[]) => {
    if (items) {
      // Get the individual items, not the parent/group items
      updateExcludedCategories(
        items.filter((itm) => {
          return itm.parentId !== "";
        })
      );

      closeModal();
    }
  };

  // const toggleCategoryInclusion = (id: string) => {
  //   let newExcluded = [...excluded];

  //   const idx = newExcluded.indexOf(id);
  //   if (idx !== -1) {
  //     newExcluded.splice(idx, 1);
  //   } else {
  //     newExcluded.push(id);
  //   }

  //   setExcluded(newExcluded);
  // };

  // const [excluded, setExcluded] = useState<string[]>([]);
  // const hierarchyTableProps = useHierarchyTable(budgetCategories, createList);
  const hierarchyProps = useHierarchyTable(
    "AllCategoriesEditable",
    createList(getBudgetCategories(budget))
  );

  // log("excluded list", excluded);
  // log("rendering list", hierarchyProps.listData);

  return (
    <div className="relative flex flex-col items-center text-center h-full px-1 pb-2">
      <div className="mt-2 text-sm">
        This is a list of all the categories from YNAB, which are currently
        included on the{" "}
        <span className="font-cinzel text-lg underline">Budget Helper</span>{" "}
        widget.
        <br />
        <br />
        Use the list below to add/remove categories from the chart/table.
      </div>

      <Card className="relative w-full my-2 h-full px-2">
        <div className="absolute p-1 top-1 bottom-1 right-0 left-0 overflow-y-auto">
          <HierarchyTable
            tableData={hierarchyProps}
            getRowContent={getRowContent}
            indentPixels={"20px"}
            showCheckboxes={true}
          />
        </div>
      </Card>

      <MyButton
        buttonText={"Save"}
        icon={<CheckIcon className="h-6 w-6 text-green-600 stroke-2" />}
        onClick={() => onSave(hierarchyProps.listData)}
        className="w-full h-12 bg-gray-300 rounded-md shadow-slate-400 shadow-sm hover:bg-blue-400 hover:text-white"
      />
    </div>
  );
}

export default AllCategoriesEditable;
