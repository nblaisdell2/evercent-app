import {
  CheckIcon,
  MinusCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { format, parseISO, startOfMonth, startOfToday } from "date-fns";
import React, { useState } from "react";
import Card from "../../elements/Card";
import HierarchyTable, { CheckboxItem } from "../../elements/HierarchyTable";
import Label from "../../elements/Label";
import LabelAndValue from "../../elements/LabelAndValue";
import MyButton from "../../elements/MyButton";
import {
  getDateOnly,
  getMoneyString,
  getPercentString,
  sum,
} from "../../../utils/util";
import PostingMonthBreakdown from "../../other/PostingMonthBreakdown";
import { RegularExpensesState } from "../../../hooks/useRegularExpenses";
import useModal from "../../../hooks/useModal";
import ModalContent from "../../modals/ModalContent";
import ResetExpensesProgress from "../../modals/ResetExpensesProgress";
import { log } from "../../../utils/log";
import { Item } from "react-stately";
import { PostingMonth } from "evercent/dist/category";

function RegularExpenseDetails({ reProps }: { reProps: RegularExpensesState }) {
  const modalProps = useModal({});

  const [clicked, setClicked] = useState<CheckboxItem | null>(null);
  const [hovered, setHovered] = useState<CheckboxItem | null>(null);

  const getAddRemoveButtons = (item: CheckboxItem) => {
    return (
      <div className="group:hover:pointer-events-none h-6 flex items-center border-2 border-blue-900 dark:border-purple-700 rounded-lg font-bold text-sm sm:text-base">
        <div
          className={`flex-grow border-r rounded-tl-md rounded-bl-md border-blue-900 dark:border-purple-700 text-center hover:cursor-pointer hover:bg-blue-700 dark:hover:bg-purple-300 dark:hover:text-black ${
            clicked?.id == item.id ? "hover:opacity-100" : "hover:opacity-60"
          } hover:text-white hover:font-bold`}
          onClick={() => reProps.updateMonthsAheadForCategory(item.data, false)}
          onMouseDown={() => {
            setClicked(item);
          }}
          onMouseUp={() => {
            setClicked(null);
          }}
          onMouseEnter={() => {
            setHovered(item);
          }}
          onMouseLeave={() => {
            setHovered(null);
          }}
        >
          <div className="unselectable">-</div>
        </div>
        <div
          className={`flex-grow border-l border-blue-900 dark:border-purple-700 rounded-tr-md rounded-br-md text-center hover:cursor-pointer hover:bg-blue-700 dark:hover:bg-purple-300 dark:hover:text-black ${
            clicked?.id == item.id ? "hover:opacity-100" : "hover:opacity-60"
          } hover:text-white hover:font-bold`}
          onClick={() => reProps.updateMonthsAheadForCategory(item.data, true)}
          onMouseDown={() => {
            setClicked(item);
          }}
          onMouseUp={() => {
            setClicked(null);
          }}
          onMouseEnter={() => {
            setHovered(item);
          }}
          onMouseLeave={() => {
            setHovered(null);
          }}
        >
          <div className="unselectable">+</div>
        </div>
      </div>
    );
  };

  const getRowContent = (item: CheckboxItem, indent: number) => {
    switch (indent) {
      case 0: {
        const postingMonths = reProps.getPostingMonthsForGroup(item.data);
        // log(postingMonths);

        return (
          <div
            className={`flex flex-grow justify-between items-center font-mplus py-[1px] text-sm sm:text-base font-extrabold hover:bg-gray-200 dark:hover:bg-gray-900 hover:cursor-pointer rounded-lg`}
          >
            <div className=" w-[50%] flex items-center">
              <div>{item.name}</div>
            </div>
            {resetProgress && <div className="w-[17%]"></div>}
            <div className={`${resetProgress ? "w-[17%]" : "w-[25%]"} `}></div>
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-right pr-2 `}
            >
              {getMoneyString(sum(postingMonths, "amount"))}
            </div>
          </div>
        );
      }
      case 1: {
        if (!item.data) return <></>;

        const postingMonths = reProps.getPostingMonthsForCategory(item.data);
        // log("postingMonths", postingMonths);

        // const grp = regularExpenses.filter(
        //   (g: any) => g.groupID == item.parentId
        // )[0];
        // const cat = grp?.categories.filter(
        //   (c: any) => c.categoryID == item.id
        // )[0];
        const monthsCalc = postingMonths.filter(
          (pm) => pm.month !== getDateOnly(startOfMonth(new Date()))
        );
        return (
          <div
            className={`flex group w-full justify-between items-center font-mplus py-[1px] text-sm sm:text-base ${
              !hovered &&
              "hover:bg-gray-200 dark:hover:bg-gray-900 hover:cursor-pointer rounded-lg"
            }`}
          >
            <div className=" w-[50%] flex items-center">
              <div>{item.name}</div>
            </div>
            {resetProgress && (
              <div className="w-[17%]">{getAddRemoveButtons(item)}</div>
            )}
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-center `}
            >
              {postingMonths.length == 1 &&
                monthsCalc.length !== postingMonths.length && (
                  <span className="text-red-500 text-lg font-bold">
                    &lowast;
                  </span>
                )}
              {monthsCalc.length}
            </div>
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-right pr-2`}
            >
              {getMoneyString(sum(postingMonths, "amount"))}
            </div>
          </div>
        );
      }
      case 2: {
        if (!item.data) return <></>;

        const currMonth = item.data as PostingMonth;

        return (
          <div className="flex w-full justify-between items-center font-mplus py-[1px] text-gray-400 text-xs sm:text-sm">
            <div className=" w-[50%] flex">
              <div>
                <div className="flex items-center">
                  <div className="w-3">
                    {/* {getFirstOfMonth(
                      parseDate(getDate_Today())
                    ).toISOString() == thisSavedAmt?.month ? (
                      <span className="text-red-500 text-lg font-bold">
                        &lowast;
                      </span>
                    ) : (
                      <span></span>
                    )} */}
                  </div>
                  <div>
                    {format(parseISO(item.name), "MMM yyyy").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            {resetProgress && <div className="w-[17%]"></div>}
            <div className={`${resetProgress ? "w-[17%]" : "w-[25%]"} `}></div>
            <div
              className={`${
                resetProgress ? "w-[17%]" : "w-[25%]"
              } text-right pr-2`}
            >
              {getMoneyString(currMonth?.amount || 0, 2)}
            </div>
          </div>
        );
      }
      default:
        return <div></div>;
    }
  };

  const budgetTotal = sum(reProps.totalBudgetedByMonth, "amount");
  const resetProgress = reProps.postingDetails.status == "prep";
  // log("table data", reProps.regularExpensesTableData);
  // log("current posting details", reProps.postingDetails);

  return (
    <>
      <Card className="flex flex-col flex-grow h-0 p-2 space-y-2">
        {reProps.postingDetails.status != "posting" ? (
          <>
            {/* Top Section */}
            <div className="">
              <div className="text-center font-bold text-3xl">Details</div>

              <div className="flex justify-around items-center">
                {!resetProgress ? (
                  <>
                    <LabelAndValue
                      label={
                        <div className="leading-6">
                          Total Saved for
                          <br />
                          Future Months
                        </div>
                      }
                      value={getMoneyString(budgetTotal)}
                      classNameLabel={"line"}
                      classNameValue={"text-green-500 text-2xl"}
                    />

                    {budgetTotal > 0 && (
                      <LabelAndValue
                        label={"Total Saved by Month"}
                        value={
                          <PostingMonthBreakdown
                            months={reProps.totalBudgetedByMonth}
                            showPercent={false}
                            showTotal={false}
                            formatMonth={(pm) =>
                              pm.month == "Total"
                                ? pm.month
                                : format(
                                    parseISO(pm.month.substring(0, 10)),
                                    "MMM yyyy"
                                  ).toUpperCase()
                            }
                          />
                        }
                        classNameValue={"h-24 w-full overflow-y-auto"}
                      />
                    )}

                    <MyButton
                      buttonText={
                        <div className="font-semibold text-base">
                          Reset
                          <br />
                          Progress
                        </div>
                      }
                      icon={
                        <QuestionMarkCircleIcon className="h-10 w-10 text-black dark:text-[#F6F9FA] group-hover:text-blue-900 dark:group-hover:text-purple-800  stroke-2 mr-1" />
                      }
                      onClick={modalProps.showModal}
                    />
                  </>
                ) : (
                  <>
                    <LabelAndValue
                      label={
                        <div className="leading-6">
                          Total Amount Available
                          <br />
                          in Budget
                        </div>
                      }
                      value={getMoneyString(
                        reProps.budgetAmounts.totalAvailable
                      )}
                      classNameValue={"text-green-500 text-2xl"}
                    />
                    <LabelAndValue
                      label={
                        <div className="leading-6">
                          Amount
                          <br />
                          Used
                        </div>
                      }
                      value={getMoneyString(reProps.budgetAmounts.amountUsed)}
                      classNameValue={"text-2xl"}
                    />
                    <LabelAndValue
                      label={
                        <div className="leading-6">
                          Amount
                          <br />
                          Remaining
                        </div>
                      }
                      value={getMoneyString(
                        reProps.budgetAmounts.amountRemaining
                      )}
                      classNameValue={"text-green-500 text-2xl"}
                    />
                  </>
                )}
              </div>
            </div>

            {/* TABLE STARTS HERE */}
            <div className="flex flex-col h-0 flex-grow">
              <div className="flex items-center border-t border-b border-black dark:border-[#F6F9FA] py-1">
                <div
                  className={`w-[50%] font-bold text-sm sm:text-lg pl-3 sm:pl-6`}
                >
                  Category
                </div>
                {resetProgress && (
                  <div
                    className={`w-[17%] font-bold text-sm sm:text-lg text-center pr-2 leading-5`}
                  >
                    Add
                    <br />
                    Remove
                  </div>
                )}
                <div
                  className={`${
                    resetProgress ? "w-[17%]" : "w-[25%]"
                  } font-bold text-sm sm:text-lg text-center pr-2 leading-5`}
                >
                  # of
                  <br />
                  Months
                </div>
                <div
                  className={`${
                    resetProgress ? "w-[17%]" : "w-[25%]"
                  } font-bold text-sm sm:text-lg text-right pr-2 leading-5`}
                >
                  Total
                  <br />
                  Amount
                </div>
              </div>

              <div className="flex flex-col overflow-y-auto no-scrollbar">
                <HierarchyTable
                  tableData={reProps.regularExpensesTableData}
                  getRowContent={getRowContent}
                  indentPixels={"20px"}
                  isCollapsible={true}
                  disableOnClick={hovered !== null}
                  onDataChanged={(newItems: CheckboxItem[]) => {
                    log("what are the new items?", newItems);
                    const newGroups = newItems
                      .filter(
                        (itm) =>
                          itm.parentId == "" &&
                          itm.expanded != undefined &&
                          itm.expanded
                      )
                      .map((itm) => itm.id);
                    const newCats = newItems
                      .filter(
                        (itm) =>
                          itm.parentId != "" &&
                          itm.expanded != undefined &&
                          itm.expanded
                      )
                      .map((itm) => itm.id);
                    reProps.setExpandedGroups(newGroups);
                    reProps.setExpandedCategories(newCats);
                    // reProps.regularExpensesTableData.setListData(newItems);
                  }}
                />
              </div>
            </div>

            {/* "Posting To budget / Cancel" buttons */}
            {resetProgress && (
              <div className="flex items-end justify-center space-x-4 pt-2 border-t border-black dark:border-[#F6F9FA]">
                <MyButton
                  buttonText={
                    <div className="font-semibold text-base">
                      Post Amounts
                      <br />
                      to Budget
                    </div>
                  }
                  icon={
                    <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
                  }
                  onClick={reProps.postCategoryAmountsToBudget}
                  className={"h-full w-[45%]"}
                />
                <MyButton
                  buttonText={
                    <div className="font-semibold text-base">Go Back</div>
                  }
                  icon={
                    <MinusCircleIcon className="h-10 w-10 text-red-600 stroke-2 mr-1" />
                  }
                  onClick={reProps.undoResetProgress}
                  className={"h-full w-[45%] text-base"}
                />
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center space-y-32">
            <div className="text-center font-bold text-3xl">
              Posting to Budget
            </div>

            <div className="flex flex-col w-full space-y-10">
              {/* Progress Bar */}
              <div className="px-2">
                <Label label={"Current Progress"} className="px-2" />
                <div className="bg-gray-300 h-6 rounded-md shadow-md shadow-slate-400">
                  <div
                    style={{
                      width: getPercentString(reProps.postingDetails.progress),
                    }}
                    className="h-6 rounded-md bg-green-600"
                  ></div>
                </div>
              </div>

              {/* Posting Info */}
              <div className="flex flex-col space-y-4">
                <LabelAndValue
                  label={"Currently Posting to Budget"}
                  value={reProps.postingDetails.category.categoryName}
                  classNameValue={"text-2xl"}
                />
                <LabelAndValue
                  label={"Month"}
                  value={format(
                    parseISO(
                      reProps.postingDetails.category.month ||
                        new Date().toISOString()
                    ),
                    "MMM yyyy"
                  ).toUpperCase()}
                  classNameValue={"text-2xl"}
                />
                <LabelAndValue
                  label={"Amount"}
                  value={getMoneyString(
                    reProps.postingDetails.category.amount || 0,
                    2
                  )}
                  classNameValue={"text-2xl text-green-600"}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      <ModalContent
        fullScreen={false}
        modalTitle="Reset Budget Amounts?"
        modalProps={modalProps}
      >
        <ResetExpensesProgress
          closeModal={modalProps.closeModal}
          startResetProgress={reProps.startResetProgress}
        />
      </ModalContent>
    </>
  );
}

export default RegularExpenseDetails;
