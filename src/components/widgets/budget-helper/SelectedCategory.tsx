import React from "react";
import { format, parseISO } from "date-fns";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import Label from "../../elements/Label";
import Card from "../../elements/Card";
import MyDatePicker from "../../elements/MyDatePicker";
import MyToggle from "../../elements/MyToggle";
import MyToggleButton from "../../elements/MyToggleButton";
import MyInput from "../../elements/MyInput";
import {
  Category,
  RegularExpenses,
  calculateUpcomingExpense,
  isRegularExpense,
  isUpcomingExpense,
} from "../../../model/category";
import { getMoneyString } from "../../../utils/util";
import MySelect from "../../elements/MySelect";
import { log } from "../../../utils/log";
import useEvercent from "../../../hooks/useEvercent";
import { Budget } from "../../../model/budget";
import { PayFrequency } from "../../../model/userData";
import PostingMonthBreakdown from "../../other/PostingMonthBreakdown";
import { BudgetHelperState } from "../../../hooks/useBudgetHelper";

function SelectedCategory({ bhProps }: { bhProps: BudgetHelperState }) {
  const { budget, userData } = useEvercent();

  const selectedCategory = bhProps.selectedCategory as Category;

  const upcomingDetails = calculateUpcomingExpense(
    budget as Budget,
    selectedCategory,
    userData?.payFrequency as PayFrequency,
    bhProps.nextPaydate
  );

  log({ selectedCategory, upcomingDetails });

  return (
    <div className="flex flex-col flex-grow mt-4 overflow-y-auto sm:overflow-y-visible ">
      <div className="inline-flex items-center">
        <div
          onClick={() => bhProps.setSelectedCategory(undefined)}
          className="inline-flex border-b border-transparent hover:border-black dark:hover:border-white hover:cursor-pointer"
        >
          <ArrowLeftIcon className="h-6 w-6 mr-1" />
          <Label
            label="Back to Category List"
            className="text-xl no-underline"
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto sm:overflow-y-visible sm:no-scrollbar ">
        <div className="flex h-full pt-2">
          {/* left side */}
          <div className="w-[25%] mr-2">
            <Card className="h-full flex flex-col space-y-12 items-center p-2">
              <div className="font-bold text-center text-3xl">
                {selectedCategory.name}
              </div>
              <div className="flex w-full text-center justify-around">
                <div>
                  <div className="font-semibold">Amount</div>
                  <MyInput
                    value={selectedCategory.amount}
                    onChange={(newVal: number) => {
                      bhProps.updateSelectedCategoryAmount(
                        selectedCategory,
                        "amount",
                        newVal
                      );
                    }}
                    className={"h-8 w-32"}
                  />
                </div>
                <div>
                  <div className="font-semibold">Extra Amount</div>
                  <MyInput
                    value={selectedCategory.extraAmount}
                    onChange={(newVal: number) => {
                      bhProps.updateSelectedCategoryAmount(
                        selectedCategory,
                        "extraAmount",
                        newVal
                      );
                    }}
                    className={"h-8 w-32"}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center w-full">
                <div className="text-2xl font-bold mb-2">Options</div>
                <div>
                  <label className="flex mb-2 hover:cursor-pointer">
                    <MyToggle
                      checked={isRegularExpense(selectedCategory)}
                      onToggle={(checked) => {
                        bhProps.toggleSelectedCategoryOptions(
                          selectedCategory,
                          checked,
                          "Regular Expense"
                        );
                      }}
                      className="mr-2"
                    />
                    <div>Regular Expense</div>
                  </label>
                  <label className="flex hover:cursor-pointer">
                    <MyToggle
                      checked={isUpcomingExpense(selectedCategory)}
                      onToggle={(checked) => {
                        bhProps.toggleSelectedCategoryOptions(
                          selectedCategory,
                          checked,
                          "Upcoming Expense"
                        );
                      }}
                      className="mr-2"
                    />
                    <div>Upcoming Expense</div>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* right side */}
          <div className="flex flex-col flex-grow justify-center ">
            {/* top section */}
            <div className="flex justify-around p-2 ">
              {/* Amounts Section */}
              <div className="text-center">
                <div className="mb-2">
                  <Label label={"Adjusted Amount"} className="text-xl" />
                  <div className="font-bold text-3xl">
                    {getMoneyString(selectedCategory.adjustedAmount, 2)}
                  </div>
                </div>
                <div>
                  <Label label={"Adjusted plus Extra"} className="text-xl" />
                  <div className="font-bold text-3xl">
                    {getMoneyString(
                      selectedCategory.adjustedAmountPlusExtra,
                      2
                    )}
                  </div>
                </div>
              </div>

              {/* Posting Months Section */}
              <Card className="w-96">
                <Label
                  label={"Posting Months on Next Paydate"}
                  className="text-xl text-center"
                />
                <div className="overflow-y-auto no-scrollbar">
                  <div className="h-24 text-xl">
                    {selectedCategory.postingMonths.length == 0 ? (
                      <div className=" flex justify-center items-center font-bold text-2xl h-full">
                        N/A
                      </div>
                    ) : (
                      <PostingMonthBreakdown
                        months={selectedCategory.postingMonths}
                        showPercent={false}
                        showTotal={false}
                        digits={2}
                        formatMonth={(pm) => {
                          if (pm.month == "Total") {
                            return pm.month;
                          }
                          return format(
                            parseISO(pm.month.substring(0, 10)),
                            "MMMM yyyy"
                          );
                        }}
                      />
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* bottom section */}
            {/* Regular Expense section */}
            {isRegularExpense(selectedCategory) && (
              <Card className="h-full space-y-8 p-1">
                <div className="text-center font-bold text-xl">
                  Regular Expense Details
                </div>
                <div className="flex flex-col space-y-10">
                  <div className="flex justify-around">
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">Next Due Date</div>
                      <MyDatePicker
                        minValue={bhProps.nextPaydate}
                        value={
                          selectedCategory.regularExpenseDetails
                            ?.nextDueDate as string
                        }
                        onChange={(newDate: string) => {
                          bhProps.updateSelectedCategoryExpense(
                            selectedCategory,
                            "nextDueDate",
                            newDate
                          );
                        }}
                        classNamePosition={"bottom-0"}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">Frequency</div>
                      <MyToggleButton
                        leftSideTrue={
                          (
                            selectedCategory.regularExpenseDetails as RegularExpenses
                          ).isMonthly
                        }
                        leftValue={"Monthly"}
                        rightValue={"By Date"}
                        onToggle={(toggleValue: boolean) => {
                          bhProps.updateSelectedCategoryExpense(
                            selectedCategory,
                            "isMonthly",
                            toggleValue
                          );
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">Repeat Every?</div>
                      <div className="flex items-center h-10">
                        <div className="flex items-center w-16 h-full mr-1">
                          <MySelect
                            values={[
                              "1",
                              "2",
                              "3",
                              "4",
                              "5",
                              "6",
                              "7",
                              "8",
                              "9",
                              "10",
                              "11",
                              "12",
                            ]}
                            onSelectionChange={(sel) => {
                              bhProps.updateSelectedCategoryExpense(
                                selectedCategory,
                                "repeatFreqNum",
                                parseInt(sel.toString())
                              );
                            }}
                            selectedValue={
                              selectedCategory.regularExpenseDetails?.repeatFreqNum.toString() ||
                              "1"
                            }
                            isDisabled={
                              selectedCategory.regularExpenseDetails?.isMonthly
                            }
                          />
                        </div>
                        <div className="flex items-center h-full ml-1">
                          <MySelect
                            values={["Months", "Years"]}
                            onSelectionChange={(sel) => {
                              bhProps.updateSelectedCategoryExpense(
                                selectedCategory,
                                "repeatFreqType",
                                sel.toString()
                              );
                            }}
                            selectedValue={
                              selectedCategory.regularExpenseDetails
                                ?.repeatFreqType || "Months"
                            }
                            isDisabled={
                              selectedCategory.regularExpenseDetails?.isMonthly
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-around">
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">Include on Chart?</div>
                      <MyToggle
                        checked={
                          selectedCategory.regularExpenseDetails
                            ? selectedCategory.regularExpenseDetails
                                .includeOnChart
                            : true
                        }
                        onToggle={(checked) => {
                          bhProps.updateSelectedCategoryExpense(
                            selectedCategory,
                            "includeOnChart",
                            checked
                          );
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">
                        Multiple Monthly Transactions?
                      </div>
                      <MyToggle
                        checked={
                          selectedCategory.regularExpenseDetails
                            ? selectedCategory.regularExpenseDetails
                                .multipleTransactions
                            : true
                        }
                        onToggle={(checked) => {
                          bhProps.updateSelectedCategoryExpense(
                            selectedCategory,
                            "multipleTransactions",
                            checked
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Upcoming Expense section */}
            {isUpcomingExpense(selectedCategory) && (
              <Card className="flex flex-col flex-grow p-1 text-xl">
                <div className="text-center font-bold text-xl">
                  Upcoming Expense Details
                </div>
                <div className="flex justify-around items-center h-full">
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">Total Purchase Amount</div>
                    <MyInput
                      value={
                        selectedCategory.upcomingDetails?.expenseAmount || 0
                      }
                      onChange={(newVal: number) => {
                        bhProps.updateSelectedCategoryUpcomingAmount(
                          selectedCategory,
                          newVal
                        );
                      }}
                      className={"h-8 w-56"}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <Label label={"Purchase Date"} className="font-semibold" />
                    <div className="font-bold text-2xl">
                      {upcomingDetails?.totalAmount == 0
                        ? "----"
                        : format(
                            parseISO(upcomingDetails?.purchaseDate as string),
                            "MMM d, yyyy"
                          )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Label label={"Days Away"} className="font-semibold" />
                    <div className="font-bold text-2xl">
                      {upcomingDetails?.totalAmount == 0
                        ? "----"
                        : upcomingDetails?.daysAway}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectedCategory;
