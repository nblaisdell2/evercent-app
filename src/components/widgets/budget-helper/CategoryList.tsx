import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import Card from "../../elements/Card";
import Label from "../../elements/Label";
import {
  Category,
  CategoryGroup,
  getAllCategories,
  getPercentIncome,
  isRegularExpense,
  isUpcomingExpense,
} from "../../../model/category";
import HierarchyTable, { CheckboxItem } from "../../elements/HierarchyTable";
import { getMoneyString, getPercentString } from "../../../utils/util";
import MyButton from "../../elements/MyButton";
import MyIcon from "../../elements/MyIcon";
import ModalContent from "../../modals/ModalContent";
import useModal from "../../../hooks/useModal";
import AllCategoriesEditable from "../../modals/AllCategoriesEditable";
import { BudgetHelperState } from "../../../hooks/useBudgetHelper";
import useEvercent from "../../../hooks/useEvercent";
import { Budget } from "../../../model/budget";

function CategoryList({ bhProps }: { bhProps: BudgetHelperState }) {
  const { budget } = useEvercent();
  const modalProps = useModal();

  const createGroupRow = (grp: CategoryGroup) => {
    return !grp ? (
      <></>
    ) : (
      <div
        key={grp.groupName}
        className="flex py-[2px] sm:py-0 w-full font-bold text-right hover:bg-gray-300 dark:hover:bg-gray-800 hover:cursor-pointer hover:rounded-md"
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
          {getPercentString(getPercentIncome(bhProps.monthlyIncome, grp))}
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
          bhProps.setSelectedCategory(category);
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
          {getPercentString(getPercentIncome(bhProps.monthlyIncome, category))}
        </div>
      </div>
    );
  };

  const getRowContent = (item: CheckboxItem, indent: number) => {
    const itemID = indent == 0 ? item.id : item.parentId;
    const grp = bhProps.categoryList.filter(
      (cGrp) => cGrp.groupID == itemID
    )[0];
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
              tableData={bhProps.hierarchyProps}
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
                {getAllCategories(bhProps.categoryList, true).length}
              </div>

              {/* Edit Icon */}
              <MyIcon
                iconType={"EditIcon"}
                className="h-8 w-8 stroke-2 hover:cursor-pointer"
                onClick={() => {
                  modalProps.showModal();
                }}
              />
            </div>
          </div>

          <MyButton
            buttonText={"Save"}
            icon={<CheckIcon className="h-6 w-6 text-green-600 stroke-2" />}
            disabled={!bhProps.changesMade}
            onClick={bhProps.saveCategories}
            className="py-2"
          />
        </div>
      </div>

      <ModalContent
        modalTitle="Category List"
        fullScreen={false}
        modalProps={modalProps}
      >
        <AllCategoriesEditable
          budget={budget as Budget}
          categoryGroups={bhProps.categoryList}
          updateExcludedCategories={bhProps.updateExcludedCategories}
          closeModal={modalProps.closeModal}
        />
      </ModalContent>
    </div>
  );
}

export default CategoryList;
