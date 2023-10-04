import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { format, parseISO } from "date-fns";
import React from "react";
import Card from "../../elements/Card";
import Label from "../../elements/Label";
import LabelAndValue from "../../elements/LabelAndValue";

import { getMoneyString } from "../../../utils/util";
import PostingMonthBreakdown from "../../other/PostingMonthBreakdown";
import { AutoRun, getAutoRunPostingMonths } from "../../../model/autoRun";
import { BudgetAutomationState } from "../../../hooks/useBudgetAutomation";
import { log } from "../../../utils/log";

function AutomationOverview({ baProps }: { baProps: BudgetAutomationState }) {
  const months = getAutoRunPostingMonths(
    (baProps.showUpcoming
      ? baProps.nextAutoRun
      : baProps.selectedPastRun) as AutoRun
  );

  return (
    <div className="flex flex-col h-full space-y-2">
      <Card className="flex flex-col items-center flex-grow p-2 overflow-y-auto">
        {!baProps.selectedPastRunCategory ? (
          <>
            <div className="text-center font-mplus text-3xl font-extrabold">
              Overview
            </div>
            <div className="flex-grow w-[65%] h-0 overflow-y-auto no-scrollbar flex flex-col justify-center text-3xl ">
              {months.length > 0 && (
                <LabelAndValue
                  label={"Posting Month Breakdown"}
                  value={
                    <PostingMonthBreakdown
                      months={months}
                      showPercent={true}
                      formatMonth={(pm) => {
                        if (pm.month == "Total") {
                          return pm.month;
                        }
                        return format(parseISO(pm.month), "MMMM yyyy");
                      }}
                    />
                  }
                  classNameLabel=""
                  classNameValue={"mt-2 w-full "}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col w-full h-full">
            <div
              className="flex items-center hover:cursor-pointer"
              onClick={() => {
                baProps.selectPastRunCategory(null);
              }}
            >
              <ArrowLeftIcon className="h-8 w-8 stroke-2 mr-1" />
              <Label label={"Back to Overview"} className="text-lg" />
            </div>
            <div className="flex justify-around items-center">
              <div className="flex-grow text-center text-3xl font-bold">
                {baProps.selectedPastRunCategory.categoryName}
              </div>
              <div className="flex-grow">
                <div className="flex justify-around">
                  <LabelAndValue
                    label={"Amount"}
                    value={getMoneyString(
                      baProps.selectedPastRunCategory.categoryAmount
                    )}
                    classNameValue={"text-2xl font-mplus"}
                  />
                  <LabelAndValue
                    label={"Extra Amount"}
                    value={getMoneyString(
                      baProps.selectedPastRunCategory.categoryExtraAmount
                    )}
                    classNameValue={"text-2xl font-mplus"}
                  />
                  <LabelAndValue
                    label={"Adjusted Amount"}
                    value={getMoneyString(
                      baProps.selectedPastRunCategory.categoryAdjustedAmount
                    )}
                    classNameValue={"text-2xl font-mplus"}
                  />
                </div>
                <div>
                  <LabelAndValue
                    label={"Adjusted Amount per Paycheck"}
                    value={getMoneyString(
                      baProps.selectedPastRunCategory
                        .categoryAdjustedAmountPerPaycheck
                    )}
                    classNameValue={"text-2xl font-mplus"}
                  />
                </div>
              </div>
            </div>

            <div className="flex-grow h-full ">
              <div className="border-b border-black dark:border-[#F6F9FA] mt-2 pb-1 text-xl font-bold">
                Explanation of Amounts
              </div>
              <div className="">(explanation goes here)</div>
            </div>
            <div className="">
              <div className="border-b border-black dark:border-[#F6F9FA] mt-2 pb-1 text-xl font-bold">
                Amounts Posted
              </div>
              <div className="flex justify-between border-b border-black dark:border-[#F6F9FA]">
                <div className="text-sm text-center font-bold w-[25%] ">
                  Month/Year
                </div>
                <div className="text-sm text-right pr-1 font-bold w-[25%] ">
                  Previous Amount
                </div>
                <div className="text-sm text-right pr-1 font-bold w-[25%] ">
                  Added Amount
                </div>
                <div className="text-sm text-right pr-1 font-bold w-[25%] ">
                  New Amount
                </div>
              </div>
              <div>
                {baProps.selectedPastRunCategory.postingMonths?.map((pm) => {
                  const amt = {
                    monthYear: format(
                      parseISO(pm.postingMonth),
                      "MMM yyyy"
                    ).toUpperCase(),
                    previousAmount: pm.oldAmountBudgeted || 0,
                    addedAmount: pm.amountPosted || 0,
                    newAmount: pm.newAmountBudgeted || 0,
                  };

                  return (
                    <div
                      className="flex justify-between text-center"
                      key={amt.monthYear}
                    >
                      <div className="text-sm w-[25%] ">{amt.monthYear}</div>
                      <div
                        className={`text-sm text-right pr-1 w-[25%]  ${
                          amt.previousAmount < 0
                            ? "text-yellow-500"
                            : amt.previousAmount == 0
                            ? "text-gray-400"
                            : "text-green-600"
                        }`}
                      >
                        {getMoneyString(amt.previousAmount, 2)}
                      </div>
                      <div className="text-sm text-right pr-1 w-[25%] ">
                        {getMoneyString(amt.addedAmount, 2)}
                      </div>
                      <div className="text-sm text-right pr-1 w-[25%]  text-green-600 ">
                        {getMoneyString(amt.newAmount, 2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AutomationOverview;
