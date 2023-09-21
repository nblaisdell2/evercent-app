import { format } from "date-fns";
import React from "react";
import LabelAndValue from "./elements/LabelAndValue";
import { getMoneyString } from "../utils/util";

function UpcomingExpensesWidget() {
  const upcomingDetails: any = null;
  // getUpcomingCategoryDetails(
  //   categories,
  //   budgetMonths,
  //   payFrequency,
  //   nextPaydate
  // )[0];

  if (!upcomingDetails?.category)
    return (
      <div className="font-bold text-2xl text-center">
        Use the <span className="font-cinzel text-3xl">Budget Helper</span>{" "}
        widget, and mark some categories as an <u>Upcoming Expense</u> to see
        those details here.
      </div>
    );

  return (
    <div className="h-full w-full flex flex-col justify-evenly">
      <LabelAndValue
        label={"Next Expense"}
        value={upcomingDetails.category.name}
        classNameValue={"text-3xl sm:text-5xl"}
      />
      <div className="flex justify-around">
        <LabelAndValue
          label={"Amount Saved"}
          value={
            getMoneyString(upcomingDetails.amountSaved) +
            " / " +
            getMoneyString(
              upcomingDetails.category.upcomingDetails.expenseAmount
            )
          }
          classNameValue={"text-lg sm:text-3xl"}
        />
        <LabelAndValue
          label={"Purchase Date"}
          value={
            <div className="text-center">
              <div className="text-lg sm:text-3xl">
                {format(new Date(), "MM/dd/yyyy")}
              </div>
              <div className="text-sm sm:text-xl -mt-1">
                {"(" + upcomingDetails.daysAway.toString() + " days)"}
              </div>
            </div>
          }
        />
        <LabelAndValue
          label={"# of Paychecks"}
          value={upcomingDetails.paychecksAway}
          classNameValue={"text-lg sm:text-3xl"}
        />
      </div>
    </div>
  );
}

export default UpcomingExpensesWidget;
