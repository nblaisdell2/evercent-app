import React from "react";
import LabelAndValue from "./elements/LabelAndValue";
import { getMoneyString } from "../utils/util";

function Amounts() {
  const totalAmountUsed = 0; //getTotalAmountUsed(categoryList);
  const monthlyIncome = 0;

  const type: string = "widget";

  return (
    <div
      className={`flex justify-center ${
        type == "full" ? "sm:justify-end" : "justify-around sm:justify-center"
      } space-x-4 sm:space-x-24`}
    >
      <div className={`${type == "widget" ? "hidden sm:block" : "block"}`}>
        <div className="flex flex-col items-center w-18">
          <LabelAndValue
            label={"Monthly Income"}
            value={getMoneyString(monthlyIncome)}
            classNameLabel={"text-sm sm:text-xl"}
            classNameValue={"text-2xl sm:text-3xl text-green-500"}
          />
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center w-18">
          <LabelAndValue
            label={"Amount Remaining"}
            value={getMoneyString(monthlyIncome - totalAmountUsed)}
            classNameLabel={"text-sm sm:text-xl"}
            classNameValue={`text-2xl sm:text-3xl ${
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
            classNameLabel={"text-sm sm:text-xl"}
            classNameValue={`text-2xl sm:text-3xl`}
          />
        </div>
      </div>
      {type == "full" && (
        <div className="flex flex-col justify-end">
          <div className="flex flex-col items-center w-18">
            <LabelAndValue
              label={"% Used"}
              value={
                "0%" /*calculatePercentString(totalAmountUsed, monthlyIncome)*/
              }
              classNameLabel={"text-sm sm:text-xl"}
              classNameValue={`text-2xl sm:text-3xl`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Amounts;
