import React from "react";
import { PostingMonth } from "../../model/category";
import { getMoneyString, getPercentString } from "../../utils/util";

type Props = {
  months: PostingMonth[];
  showPercent: boolean;
  formatMonth: (pm: PostingMonth) => string;
  digits?: number;
  showTotal?: boolean | undefined;
};

function PostingMonthBreakdown({
  months,
  showPercent,
  showTotal,
  digits,
  formatMonth,
}: Props) {
  if (showTotal == undefined) {
    showTotal = true;
  }

  let newMonths = [...months];
  if (showTotal) {
    newMonths.push({
      month: "Total",
      amount: newMonths.reduce((prev, curr) => prev + curr.amount, 0),
      percent: newMonths.reduce((prev, curr) => prev + curr.percent, 0),
    });
  }

  return (
    <>
      {newMonths.map((m) => {
        return (
          <div className="flex justify-center" key={m.month}>
            {m.month == "Total" && <div className="h-[1px] bg-black" />}
            <div className={`w-[60%] font-semibold text-right`}>
              {formatMonth(m)}
            </div>

            <div
              className={`min-w-[25%] text-right font-semibold text-green-500`}
            >
              {getMoneyString(m.amount, digits || 0)}
            </div>

            <div className="flex-grow text-right font-semibold">
              {showPercent && getPercentString(m.percent / 100)}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default PostingMonthBreakdown;
