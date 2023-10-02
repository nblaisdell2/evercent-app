import React from "react";
import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";
import {
  CategoryGroup,
  getCategoryGroupsWithAmounts,
  getTotalAmountUsed,
} from "../../../model/category";
import { getPercentString } from "../../../utils/util";
import useEvercent from "../../../hooks/useEvercent";

const CHART_COLORS = [
  "#3366cc",
  "#dc3912",
  "#ff9900",
  "#109618",
  "#990099",
  "#0099c6",
  "#dd4477",
  "#66aa00",
  "#b82e2e",
  "#316395",
  "#994499",
  "#22aa99",
  "#aaaa11",
  "#6633cc",
  "#e67300",
  "#8b0707",
  "#651067",
  "#329262",
  "#5574a6",
  "#3b3eac",
  "#b77322",
  "#16d620",
  "#b91383",
  "#f4359e",
  "#9c5935",
  "#a9c413",
  "#2a778d",
  "#668d1c",
  "#bea413",
  "#0c5922",
  "#743411",
];

function BudgetHelperWidget() {
  const getLegendGrid = (catList: CategoryGroup[], numRows: number) => {
    const totalUsed = getTotalAmountUsed(catList, false);
    const monthlyIncome = userData?.monthlyIncome || 0;
    const percUnused = (monthlyIncome - totalUsed) / monthlyIncome;

    const numCols = Math.floor((catList.length + 1) / numRows) + 1;

    let myPaddingLeft = "0";
    switch (numCols) {
      case 1:
        myPaddingLeft = "35%";
        break;
      case 2:
        myPaddingLeft = "20%";
        break;
      case 3:
        myPaddingLeft = "12%";
        break;
    }

    if (catList.length == 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="font-bold text-2xl ">No Categories Selected</div>
        </div>
      );
    }

    return (
      <>
        {catList.map((grp: CategoryGroup, i) => {
          if (grp.adjustedAmountPlusExtra == 0) return null;
          return (
            <div
              className="flex items-center"
              key={grp.groupName}
              style={{
                paddingLeft: myPaddingLeft,
              }}
            >
              <div
                className="h-2 w-2 rounded-full "
                style={{
                  backgroundColor: CHART_COLORS[i],
                }}
              ></div>
              <div className="font-semibold ml-1 text-[0.65rem] sm:text-sm whitespace-nowrap">
                {"(" +
                  getPercentString(
                    grp.adjustedAmountPlusExtra / monthlyIncome,
                    0
                  ) +
                  ") " +
                  grp.groupName}
              </div>
            </div>
          );
        })}
        <div
          className="flex items-center"
          style={{
            paddingLeft: myPaddingLeft,
          }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "#A0A0A0" }}
          ></div>
          <div className="font-semibold ml-1 text-[0.65rem] sm:text-sm">
            {"(" + getPercentString(percUnused, 0) + ") Unused"}
          </div>
        </div>
      </>
    );
  };

  const { userData, categoryGroups } = useEvercent();
  const groupsWithAmounts = getCategoryGroupsWithAmounts(categoryGroups);

  return (
    <div className="h-full flex flex-col space-y-2">
      <div className="mb-1">
        <Amounts
          monthlyIncome={userData?.monthlyIncome as number}
          categoryGroups={categoryGroups}
          type="widget"
        />
      </div>
      {groupsWithAmounts.length > 0 && (
        <div className="my-1">
          <BudgetHelperCharts
            monthlyIncome={userData?.monthlyIncome as number}
            categoryGroups={categoryGroups}
            type="widget"
          />
        </div>
      )}

      <div
        className={`p-1 flex-grow ${
          groupsWithAmounts.length > 0 ? "sm:grid grid-flow-col" : "sm:block"
        }`}
        style={{
          gridTemplateRows: "repeat(8, minmax(0, 1fr))",
        }}
      >
        {getLegendGrid(groupsWithAmounts, 8)}
      </div>
    </div>
  );
}

export default BudgetHelperWidget;
