import React from "react";
import Card from "../../elements/Card";
import MyToggleButton from "../../elements/MyToggleButton";
import { AutoRun, getAutoRunTotal } from "../../../model/autoRun";
import { BudgetAutomationState } from "../../../hooks/useBudgetAutomation";
import {
  formatTimeAMPM,
  generateUUID,
  getMoneyString,
} from "../../../utils/util";
import { format, parseISO } from "date-fns";
import { incrementDateByFrequency } from "../../../model/userData";

function UpcomingPastList({ baProps }: { baProps: BudgetAutomationState }) {
  const showUpcoming = baProps.showUpcoming;
  let runList: AutoRun[] = [];

  if (showUpcoming && baProps.autoRuns.length > 0) {
    let currDt = parseISO(
      baProps.autoRuns[0]?.runTime || new Date().toISOString()
    );
    for (let i = 0; i < 10; i++) {
      if (i == 0) {
        runList.push({ ...baProps.autoRuns[0] });
      } else {
        runList.push({
          runID: generateUUID(),
          runTime: currDt.toISOString(),
          isLocked: false,
          categoryGroups: [],
        });
      }
      currDt = incrementDateByFrequency(currDt, baProps.payFrequency);
    }
  } else {
    runList = baProps.pastRuns;
  }

  return (
    <div className="h-auto sm:h-full flex flex-col">
      <div className="flex flex-grow items-center justify-around mx-1 sm:mx-0 my-2 space-x-1">
        <MyToggleButton
          leftSideTrue={showUpcoming}
          leftValue={"Upcoming Runs"}
          rightValue={"Past Runs"}
          onToggle={baProps.toggleUpcoming}
        />
        <div className="flex flex-grow sm:flex-grow-0 font-mplus text-xs sm:text-sm italic h-auto sm:h-10 w-96 items-center sm:items-end text-right sm:text-left">
          {showUpcoming ? (
            <div>Here are the next 10 upcoming paydates</div>
          ) : (
            <div className="flex-grow">
              <span className="font-bold">Click</span> on one of the past
              paydates below to see what was posted to the budget on that date.
            </div>
          )}
        </div>
      </div>
      <Card className="flex flex-col h-28 sm:h-full overflow-y-auto font-mplus w-full p-1">
        <div className="flex w-full justify-around font-bold border-b border-black">
          <div className="w-full text-center">Date</div>
          <div className="w-full text-center">Time</div>
          {!showUpcoming && (
            <>
              <div className="hidden sm:block w-full text-center">
                Total Amount Posted
              </div>
              <div className="block sm:hidden w-full text-center whitespace-nowrap">
                Amount Posted
              </div>
            </>
          )}
        </div>
        <div className="overflow-y-auto no-scrollbar">
          {runList
            .sort((a, b) => {
              return !showUpcoming
                ? parseISO(b.runTime).getTime() - parseISO(a.runTime).getTime()
                : parseISO(a.runTime).getTime() - parseISO(b.runTime).getTime();
            })
            .map((rt: AutoRun, i: number) => {
              const isSelected = rt.runID == baProps.selectedPastRun?.runID;
              return (
                <div
                  className={`flex w-full justify-around rounded-md ${
                    ((showUpcoming && i == 0) ||
                      (!showUpcoming && isSelected)) &&
                    "font-bold"
                  } ${!showUpcoming && "hover:cursor-pointer"} ${
                    !showUpcoming &&
                    !isSelected &&
                    "hover:bg-gray-200 dark:hover:bg-gray-800"
                  }
                  } ${
                    isSelected &&
                    !showUpcoming &&
                    "bg-gray-300 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-900"
                  }`}
                  key={i}
                  onClick={() => {
                    if (showUpcoming) return;
                    baProps.selectPastRun(rt);
                  }}
                >
                  <div className={`w-full text-center`}>
                    {format(parseISO(rt.runTime), "MM/dd/yyy")}
                  </div>
                  <div className={`w-full text-center`}>
                    {formatTimeAMPM(parseISO(rt.runTime))}
                  </div>
                  {!showUpcoming && (
                    <div className="w-full text-center text-green-500">
                      {getMoneyString(getAutoRunTotal(rt))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}

export default UpcomingPastList;
