import React, { Dispatch, SetStateAction } from "react";
import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Card from "../../elements/Card";
import Label from "../../elements/Label";
import {
  Category,
  CategoryGroup,
  getAllCategories,
  getGroupAmounts,
  getPercentIncome,
  getPercentIncomeGroup,
  isRegularExpense,
  isUpcomingExpense,
} from "../../../model/category";
import HierarchyTable, { CheckboxItem } from "../../elements/HierarchyTable";
import useHierarchyTable, {
  HierarchyTableState,
} from "../../../hooks/useHierarchyTable";
import { getMoneyString, getPercentString } from "../../../utils/util";
import MyButton from "../../elements/MyButton";
import MyIcon from "../../elements/MyIcon";
import ModalContent from "../../modals/ModalContent";
import useModal from "../../../hooks/useModal";
import AllCategoriesEditable from "../../modals/AllCategoriesEditable";
import { log } from "../../../utils/log";
import { Budget } from "../../../model/budget";

function CategoryList({
  budget,
  monthlyIncome,
  categoryGroups,
  hierarchyProps,
  setSelectedCategory,
  updateExcludedCategories,
  saveCategories,
  changesMade,
}: {
  budget: Budget;
  monthlyIncome: number;
  categoryGroups: CategoryGroup[];
  hierarchyProps: HierarchyTableState;
  setSelectedCategory: Dispatch<SetStateAction<Category | undefined>>;
  updateExcludedCategories: (items: CheckboxItem[]) => void;
  saveCategories: () => void;
  changesMade: boolean;
}) {
  const { isOpen, showModal, closeModal: closeModalEditable } = useModal();

  // const {
  //   isOpen: isOpenSaving,
  //   showModal: showModalSaving,
  //   closeModal: closeModalSaving,
  // } = useModal();

  // const loadingProps = useSavingScreen(queryLoading, () => {
  //   closeModalSaving();
  //   closeModal();
  // });

  const createGroupRow = (grp: CategoryGroup) => {
    return !grp ? (
      <></>
    ) : (
      <div
        key={grp.groupName}
        className="flex py-[2px] sm:py-0 w-full font-bold text-right hover:bg-gray-300 dark:hover:bg-gray-900 hover:cursor-pointer hover:rounded-md"
      >
        <div className="flex w-[50%] sm:w-[26%] text-left">{grp.groupName}</div>
        <div className="hidden sm:block sm:w-[10%] justify-center"></div>
        <div className="hidden sm:block sm:w-[10%] justify-center"></div>
        <div className="hidden sm:block text-right w-[14%]">
          {getMoneyString(grp.amount)}
        </div>
        <div className="hidden sm:block text-right w-[14%]">
          {getMoneyString(grp.adjustedAmount)}
        </div>
        <div className="hidden sm:block text-right w-[14%]">
          {getMoneyString(grp.extraAmount)}
        </div>
        <div className="w-[25%] sm:w-[14%]">
          {getMoneyString(grp.adjustedAmountPlusExtra)}
        </div>
        <div className="w-[25%] sm:w-[14%]">
          {getPercentString(getPercentIncomeGroup(monthlyIncome, grp))}
        </div>
      </div>
    );
  };

  const createCategoryRow = (category: Category) => {
    return (
      <div
        key={category.name}
        className="flex py-[2px] sm:py-0 w-full font-normal text-right text-sm hover:bg-gray-200 dark:hover:bg-gray-800 hover:cursor-pointer hover:rounded-md"
        onClick={() => {
          setSelectedCategory(category);
        }}
      >
        <div className="w-[50%] sm:w-[26%] text-left">{category.name}</div>
        <div className="hidden sm:flex sm:w-[10%] justify-center">
          {isRegularExpense(category) && (
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
          )}
        </div>
        <div className="hidden sm:flex sm:w-[10%] justify-center">
          {isUpcomingExpense(category) && (
            <CheckIcon className="h-6 w-6 text-green-600 stroke-2" />
          )}
        </div>
        <div className="hidden sm:block w-[14%]">
          {getMoneyString(category.amount, 2)}
        </div>
        <div className="hidden sm:block w-[14%]">
          {getMoneyString(category.adjustedAmount, 2)}
        </div>
        <div className="hidden sm:block w-[14%]">
          {getMoneyString(category.extraAmount, 2)}
        </div>
        <div className="w-[25%] sm:w-[14%]">
          {getMoneyString(category.adjustedAmountPlusExtra, 2)}
        </div>
        <div className="w-[25%] sm:w-[14%]">
          {getPercentString(getPercentIncome(monthlyIncome, category))}
        </div>
      </div>
    );
  };

  const getRowContent = (item: CheckboxItem, indent: number) => {
    const itemID = indent == 0 ? item.id : item.parentId;
    const grp = categoryGroups.filter((cGrp) => cGrp.groupID == itemID)[0];
    if (grp) {
      switch (indent) {
        case 0:
          return createGroupRow(grp);
        case 1:
          const category = grp?.categories?.filter(
            (cat) => cat.categoryID.toLowerCase() == item.id.toLowerCase()
          )[0];

          if (!category) {
            return <></>;
          }
          return createCategoryRow(category);
        default:
          return <></>;
      }
    }
    return <></>;
  };

  const createList = (
    data: CategoryGroup[],
    expandedItems?: CheckboxItem[]
  ) => {
    log("Creating collapsible category list", {
      data,
      expandedItems,
    });
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

  // const saveCategories = async () => {
  //   if (changesMade) {
  //     loadingProps.setStartSaving();
  //     showModalSaving();
  //   }

  //   await onSave();

  //   if (changesMade) loadingProps.setFinishedSaving();
  // };

  // log("RENDERING [CategoryList.tsx]", {
  //   categoryGroups,
  //   listData: hierarchyProps.listData,
  // });

  return (
    <div className="flex-grow mt-4 font-mplus text-sm sm:text-base flex flex-col">
      <Label label="Category List" className="text-xl" />
      <div className="flex mt-2 h-full">
        <Card className="flex flex-col flex-grow mr-0 sm:mr-2 p-1">
          <div className="flex w-full font-bold text-right whitespace-nowrap border-b-2 dark:border-b border-black dark:border-white">
            <div className="w-[50%] sm:w-[26%] text-left pl-2">Category</div>
            <div className="hidden sm:block w-[10%] text-center">Regular?</div>
            <div className="hidden sm:block w-[10%] text-center">Upcoming?</div>
            <div className="hidden sm:block w-[14%]">Amount</div>
            <div className="hidden sm:block w-[14%]">Adjusted Amt.</div>
            <div className="hidden sm:block w-[14%]">Extra</div>
            <div className="w-[25%] sm:w-[14%]">Adj. + Extra</div>
            <div className="w-[25%] sm:w-[14%]">% Income</div>
          </div>
          <div className="flex-grow h-0 overflow-y-scroll no-scrollbar">
            <HierarchyTable
              tableData={hierarchyProps}
              getRowContent={getRowContent}
              indentPixels={"20px"}
              isCollapsible={true}
            />
          </div>
        </Card>
        <div className="flex flex-col justify-evenly items-center p-1">
          <div>
            <Label label="Categories Selected" className="text-xl" />
            <div className="flex justify-center items-center">
              <div className="font-bold text-3xl">
                {getAllCategories(categoryGroups, true).length}
              </div>

              {/* Edit Icon */}
              <MyIcon
                iconType={"EditIcon"}
                className="h-8 w-8 stroke-2 hover:cursor-pointer"
                onClick={() => {
                  showModal();
                }}
              />
            </div>
          </div>

          <MyButton
            buttonText={"Save"}
            icon={<CheckIcon className="h-6 w-6 text-green-600 stroke-2" />}
            disabled={!changesMade}
            onClick={saveCategories}
            className="py-2"
          />
        </div>
      </div>

      {isOpen && (
        <ModalContent
          modalTitle="Category List"
          fullScreen={false}
          onClose={closeModalEditable}
        >
          <AllCategoriesEditable
            budget={budget}
            categoryGroups={categoryGroups}
            // editableCategoryList={editableCategoryList}
            updateExcludedCategories={updateExcludedCategories}
            closeModal={closeModalEditable}
          />
        </ModalContent>
      )}

      {/* {isOpenSaving && (
        <ModalContent
          modalContentID={ModalType.SAVING}
          onClose={closeModalSaving}
        >
          <SavingScreen loadingProps={loadingProps} />
        </ModalContent>
      )} */}
    </div>
  );
}

export default CategoryList;
