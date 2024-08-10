import { differenceInHours, format, parseISO } from "date-fns";
import React from "react";
import LabelAndValue from "../../elements/LabelAndValue";
import { formatTimeAMPM, getMoneyString } from "../../../utils/util";
import Label from "../../elements/Label";
import Card from "../../elements/Card";
import useEvercent from "../../../hooks/useEvercent";
import PostingMonthBreakdown from "../../other/PostingMonthBreakdown";
import { getAllCategories } from "evercent/dist/category";
import {
  getAutoRunCategories,
  getAutoRunPostingMonths,
  getAutoRunTotal,
} from "evercent/dist/autoRun";

function BudgetAutomationWidget() {
  const { categoryGroups, autoRuns } = useEvercent();
  if (!categoryGroups || !autoRuns) return;

  const hasCategories =
    getAllCategories(categoryGroups, false).filter(
      (c) => c.adjustedAmountPlusExtra > 0
    ).length > 0;

  if (!hasCategories) {
    return (
      <div className={`h-full flex justify-center items-center`}>
        <div className=" font-bold text-2xl text-center">
          Use the <span className="font-cinzel text-3xl">Budget Helper</span>{" "}
          widget, and enter some amounts on the categories to see their details
          here, and be able to automatically post those amounts into your budget
          on a scheduled basis.
        </div>
      </div>
    );
  }

  const nextAutoRun = autoRuns[0];
  if (!nextAutoRun) {
    return (
      <div className={`h-full flex justify-center items-center`}>
        <div className="font-bold text-2xl">
          Click here to set a schedule
          <br />
          for automating the budget.
        </div>
      </div>
    );
  }

  const months = getAutoRunPostingMonths(nextAutoRun);
  const dtNextRunTime = parseISO(nextAutoRun.runTime);
  const hourDifference = differenceInHours(dtNextRunTime, new Date()) + 1;

  return (
    <div className={`h-full flex justify-center items-center`}>
      <div className="h-full w-full flex flex-col space-y-4">
        <div className="flex justify-around">
          <LabelAndValue
            label={"Next Auto Run"}
            value={format(dtNextRunTime, "MM/dd/yyyy")}
            classNameValue={"text-2xl"}
          />
          <LabelAndValue
            label={"Run Time"}
            value={formatTimeAMPM(dtNextRunTime)}
            classNameValue={"text-2xl"}
          />
          <LabelAndValue
            label={"Time Left"}
            value={
              Math.floor(hourDifference / 24) +
              " days " +
              (hourDifference % 24) +
              " hours"
            }
            classNameValue={"text-2xl"}
          />
        </div>
        <div className="flex justify-around h-full">
          {/* left side */}
          <div className="flex flex-col justify-evenly">
            <LabelAndValue
              label={"Amount to Post"}
              value={getMoneyString(getAutoRunTotal(nextAutoRun))}
              classNameValue={"text-green-500 text-2xl sm:text-3xl"}
            />
            <LabelAndValue
              label={"# of Categories"}
              value={getAutoRunCategories([nextAutoRun]).length}
              classNameValue={"text-2xl sm:text-3xl"}
            />
          </div>
          {/* right side */}
          <Card className="flex flex-col overflow-y-hidden p-2 w-[35%]">
            <Label
              label={"Posting Month Breakdown"}
              className="text-lg text-center"
            />
            <div className="flex-grow h-0 overflow-y-auto no-scrollbar">
              <PostingMonthBreakdown
                months={months}
                showPercent={true}
                showTotal={false}
                formatMonth={(pm) => {
                  if (pm.month == "Total") {
                    return pm.month;
                  }
                  return format(parseISO(pm.month), "MMMM yyyy");
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BudgetAutomationWidget;
