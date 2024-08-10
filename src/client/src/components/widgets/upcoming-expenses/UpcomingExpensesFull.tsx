import React from "react";
import { format, parseISO } from "date-fns";
import Card from "../../elements/Card";
import { getMoneyString } from "../../../utils/util";
import useEvercent from "../../../hooks/useEvercent";
import { PayFrequency } from "evercent/dist/user";
import { Budget } from "evercent/dist/budget";
import {
  getUpcomingCategories,
  UpcomingExpenseDetails,
} from "evercent/dist/category";

function UpcomingExpensesFull() {
  const { userData, budget, categoryGroups } = useEvercent();
  if (!categoryGroups) return;

  const upcomingCategories = getUpcomingCategories(
    budget as Budget,
    categoryGroups,
    userData?.payFrequency as PayFrequency,
    userData?.nextPaydate as string
  ) as UpcomingExpenseDetails[];

  return (
    <Card className="flex-grow flex flex-col font-mplus p-2 mt-10 mb-5 mx-4">
      <div className="flex border-t border-b font-bold py-1 border-gray-400">
        <div className="w-[20%] flex-grow pl-6">Category</div>
        <div className="w-[16%] flex-grow text-right">Amount Saved</div>
        <div className="w-[16%] flex-grow text-right">Total Amount</div>
        <div className="w-[16%] flex-grow text-right pr-0">Purchase Date</div>
        <div className="w-[16%] flex-grow text-right">Days Away</div>
        <div className="w-[16%] flex-grow text-right pr-6">Paychecks Away</div>
      </div>
      <div className="flex-grow h-0 overflow-y-scroll no-scrollbar">
        {upcomingCategories?.map((u) => {
          return (
            <div
              key={u.categoryName}
              className="flex py-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
            >
              <div className="w-[20%] flex-grow pl-6">{u.categoryName}</div>
              <div className="w-[16%] flex-grow text-right">
                {getMoneyString(u.amountSaved, 0)}
              </div>
              <div className="w-[16%] flex-grow text-right">
                {getMoneyString(u.totalAmount, 0)}
              </div>
              <div className="w-[16%] flex-grow text-right pr-0">
                {format(parseISO(u.purchaseDate), "MM/dd/yyyy")}
              </div>
              <div className="w-[16%] flex-grow text-right">{u.daysAway}</div>
              <div className="w-[16%] flex-grow text-right pr-6">
                {u.paychecksAway}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default UpcomingExpensesFull;
