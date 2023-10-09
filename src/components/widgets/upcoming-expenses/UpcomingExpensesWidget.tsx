import { format, parseISO } from "date-fns";
import React from "react";
import LabelAndValue from "../../elements/LabelAndValue";
import { getMoneyString } from "../../../utils/util";
import { getUpcomingCategories } from "../../../model/category";
import { PayFrequency } from "../../../model/userData";
import useEvercent from "../../../hooks/useEvercent";
import { Budget } from "../../../model/budget";

function UpcomingExpensesWidget() {
  const { userData, budget, categoryGroups } = useEvercent();

  const upcomingCategories = getUpcomingCategories(
    budget as Budget,
    categoryGroups,
    userData?.payFrequency as PayFrequency,
    userData?.nextPaydate as string
  );
  if (upcomingCategories.length == 0) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className=" font-bold text-2xl text-center">
          Use the <span className="font-cinzel text-3xl">Budget Helper</span>{" "}
          widget, and mark some categories as an <u>Upcoming Expense</u> to see
          those details here.
        </div>
      </div>
    );
  }

  const nextUpcomingCategory = upcomingCategories[0];

  return (
    <div className="h-full w-full flex flex-col justify-evenly">
      <LabelAndValue
        label={"Next Expense"}
        value={nextUpcomingCategory.categoryName}
        classNameValue={"text-3xl sm:text-5xl"}
      />
      <div className="flex justify-around">
        <LabelAndValue
          label={"Amount Saved"}
          value={
            getMoneyString(nextUpcomingCategory.amountSaved) +
            " / " +
            getMoneyString(nextUpcomingCategory.totalAmount)
          }
          classNameValue={"text-lg sm:text-3xl"}
        />
        <LabelAndValue
          label={"Purchase Date"}
          value={
            <div className="text-center">
              <div className="text-lg sm:text-3xl">
                {format(
                  parseISO(nextUpcomingCategory.purchaseDate),
                  "MM/dd/yyyy"
                )}
              </div>
              <div className="text-sm sm:text-xl -mt-1">
                {"(" + nextUpcomingCategory.daysAway.toString() + " days)"}
              </div>
            </div>
          }
        />
        <LabelAndValue
          label={"# of Paychecks"}
          value={nextUpcomingCategory.paychecksAway}
          classNameValue={"text-lg sm:text-3xl"}
        />
      </div>
    </div>
  );
}

export default UpcomingExpensesWidget;
