import { addDays, differenceInDays, format } from "date-fns";
import React from "react";
import {
  UpcomingExpenseDetails,
  UpcomingExpenses,
} from "../../../model/category";
import LabelAndValue from "../../elements/LabelAndValue";
import { getMoneyString } from "../../../utils/util";

const getUpcomingCategoryDetails = (
  expense: UpcomingExpenses | undefined
): UpcomingExpenseDetails | null => {
  if (!expense) return null;
  const purchaseDate = addDays(new Date(), 93);
  const daysAway = differenceInDays(new Date(), purchaseDate);
  return {
    guid: expense.guid,
    categoryName: "Test Name",
    totalAmount: expense.expenseAmount,
    amountSaved: 85,
    daysAway: daysAway,
    paychecksAway: 6,
    purchaseDate: purchaseDate.toISOString(),
  };
};

function UpcomingExpensesWidget({
  nextUpcomingExpense,
}: {
  nextUpcomingExpense?: UpcomingExpenses;
}) {
  const upcomingDetails = getUpcomingCategoryDetails(nextUpcomingExpense);
  if (!upcomingDetails) {
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

  return (
    <div className="h-full w-full flex flex-col justify-evenly">
      <LabelAndValue
        label={"Next Expense"}
        value={upcomingDetails.categoryName}
        classNameValue={"text-3xl sm:text-5xl"}
      />
      <div className="flex justify-around">
        <LabelAndValue
          label={"Amount Saved"}
          value={
            getMoneyString(upcomingDetails.amountSaved) +
            " / " +
            getMoneyString(upcomingDetails.totalAmount)
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
