import { differenceInHours, format } from "date-fns";
import React from "react";
import Card from "./elements/Card";
import Label from "./elements/Label";
import LabelAndValue from "./elements/LabelAndValue";
import { getMoneyString } from "../utils/util";

function BudgetAutomationWidget() {
  const nextAutoRun: any = null;
  const months: any[] = [];
  // nextAutoRun
  //   ? getPostingMonthsFromAutoRun(nextAutoRun, false, false)
  //   : [];

  // console.log("months in budget automation widget", months);

  const hasCategories = false;
  const dtNextRunTime = nextAutoRun?.runTime;
  const hourDifference = differenceInHours(dtNextRunTime, new Date()) + 1;
  return (
    <>
      <div className="font-cinzel text-center text-3xl text-color-primary mb-2">
        Budget Automation
      </div>
      <div
        className={`p-2 border-2 border-blue-500 h-full flex ${
          !hasCategories && "justify-center items-center"
        }`}
      >
        {!hasCategories ? (
          <div className="font-bold text-2xl text-center">
            Use the <span className="font-cinzel text-3xl">Budget Helper</span>{" "}
            widget, and enter some amounts on the categories to see their
            details here, and be able to schedule those amounts into your budget
            on a scheduled basis.
          </div>
        ) : !nextAutoRun ? (
          <div className="h-full flex items-center justify-center">
            <div className="font-bold text-2xl">
              Click here to set a schedule
              <br />
              for automating the budget.
            </div>
          </div>
        ) : (
          <div className="h-full w-full p-2 flex flex-col">
            <div className="flex justify-around">
              <LabelAndValue
                label={"Next Auto Run"}
                value={"" /*formatDate(dtNextRunTime)*/}
                classNameValue={"text-2xl"}
              />
              <LabelAndValue
                label={"Run Time"}
                value={"" /*formatTimeAMPM(dtNextRunTime)*/}
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
            <div className="flex justify-around h-full mt-3">
              {/* left side */}
              <div className=" flex flex-col justify-evenly">
                <LabelAndValue
                  label={"Amount to Post"}
                  value={getMoneyString(
                    0 /*getAutoRunTotal(nextAutoRun, false, false)*/
                  )}
                  classNameValue={"text-green-500 text-2xl sm:text-3xl"}
                />
                <LabelAndValue
                  label={"# of Categories"}
                  value={0 /*getNumberOfCategoriesInAutoRun(nextAutoRun)*/}
                  classNameValue={"text-2xl sm:text-3xl"}
                />
              </div>
              {/* right side */}
              <Card className="h-64 overflow-y-hidden">
                <Label
                  label={"Posting Month Breakdown"}
                  className="text-sm sm:text-xl whitespace-pre-wrap text-center"
                />
                <div className="h-full overflow-y-auto no-scrollbar p-1">
                  {/* <PostingMonthBreakdown
                    months={months}
                    showPercent={true}
                    showTotal={false}
                    formatMonth={(pm) => {
                      if (pm.month == "Total") {
                        return pm.month;
                      }
                      return "";
                      // return format(
                      //   parseDateCalendar(pm.month).toDate(getLocalTimeZone()),
                      //   "MMMM yyyy"
                      // );
                    }}
                  /> */}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BudgetAutomationWidget;
