import React from "react";
import LabelAndValue from "../../elements/LabelAndValue";
import { getMoneyString, getPercentString } from "../../../utils/util";
import { CategoryGroup, getTotalAmountUsed } from "../../../model/category";
import { log } from "../../../utils/log";

function Amounts({
  monthlyIncome,
  categoryGroups,
  type,
}: {
  monthlyIncome: number;
  categoryGroups: CategoryGroup[];
  type: "widget" | "full";
}) {
  const totalAmountUsed = getTotalAmountUsed(categoryGroups, false);

  return (
    <div
      className={`flex ${
        type == "full" ? "sm:justify-end" : "justify-around sm:justify-center"
      } space-x-4 sm:space-x-24`}
    >
      <div className={`${type == "widget" ? "hidden sm:block" : "block"}`}>
        <div className="flex flex-col items-center w-18">
          <LabelAndValue
            label={"Monthly Income"}
            value={getMoneyString(monthlyIncome)}
            classNameLabel={"text-xl"}
            classNameValue={"text-3xl"}
            classNameValueColor={"text-green-500"}
          />
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center w-18">
          <LabelAndValue
            label={"Amount Remaining"}
            value={getMoneyString(monthlyIncome - totalAmountUsed)}
            classNameLabel={"text-xl"}
            classNameValue={`text-3xl ${
              monthlyIncome - totalAmountUsed < 0 && "text-red-500"
            }`}
          />
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center w-18">
          <LabelAndValue
            label={"Amount Used"}
            value={getMoneyString(totalAmountUsed)}
            classNameLabel={"text-xl"}
            classNameValue={`text-3xl`}
          />
        </div>
      </div>
      {type == "full" && (
        <div className="flex flex-col justify-end">
          <div className="flex flex-col items-center w-18">
            <LabelAndValue
              label={"% Used"}
              value={getPercentString(totalAmountUsed / monthlyIncome)}
              classNameLabel={"text-xl"}
              classNameValue={`text-3xl`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Amounts;
