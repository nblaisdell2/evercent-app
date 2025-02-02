import React from "react";
import LabelAndValue from "../../elements/LabelAndValue";
import { getPercentString } from "../../../utils/util";
import useEvercent from "../../../hooks/useEvercent";
import {
  getAllCategoriesRegularExpenses,
  getNumExpensesWithTargetMet,
  getRegularExpenses,
} from "evercent/dist/category";
import { log } from "../../../utils/log";
import { Budget, getTotalBudgetedByMonthRegular } from "evercent/dist/budget";
import { UserData } from "evercent/dist/user";

function RegularExpensesWidget() {
  const { userData, budget, categoryGroups } = useEvercent();
  if (!categoryGroups) return;

  let regularExpenses = getRegularExpenses(categoryGroups);
  regularExpenses = regularExpenses.map((cg, i, arr) => {
    return {
      ...cg,
      categories: cg.categories.map((c) => {
        return {
          ...c,
          // monthsAhead: calculatemon
          postingMonths: getTotalBudgetedByMonthRegular(
            arr,
            budget as Budget,
            cg.groupID,
            c.categoryID
          ),
        };
      }),
    };
  });

  const numExpensesWithTargetMet = getNumExpensesWithTargetMet(
    regularExpenses,
    userData?.monthsAheadTarget || 6,
    budget as Budget,
    userData as UserData
  );

  const regExpenseCats = getAllCategoriesRegularExpenses(
    regularExpenses,
    false
  );
  log({ regularExpenses, regExpenseCats });
  const numRegularExpenses = regExpenseCats.length;
  if (numRegularExpenses == 0) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className=" font-bold text-2xl text-center">
          Use the <span className="font-cinzel text-3xl">Budget Helper</span>{" "}
          widget, and mark some categories as a <u>Regular Expense</u> to see
          those details here.
        </div>
      </div>
    );
  }

  // const numExpensesWithTargetMet = regExpenseCats.reduce((prev, curr) => {
  //   if (curr.monthsAhead >= (userData?.monthsAheadTarget || 6)) return prev + 1;
  //   return prev;
  // }, 0);

  return (
    <div className="h-full w-full flex flex-col justify-evenly">
      <LabelAndValue
        label={"# of Regular Expenses"}
        value={numRegularExpenses}
        classNameValue={"text-4xl sm:text-6xl"}
      />
      <LabelAndValue
        label={"Categories with Target Met"}
        value={
          <div className="flex items-center">
            <div className="text-4xl sm:text-6xl">
              {numExpensesWithTargetMet}
            </div>
            <div className="text-xl sm:text-2xl ml-1 sm:ml-2">
              {"(" +
                getPercentString(
                  numExpensesWithTargetMet / numRegularExpenses
                ) +
                ")"}
            </div>
          </div>
        }
      />
    </div>
  );
}

export default RegularExpensesWidget;
