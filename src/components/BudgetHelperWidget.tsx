import React from "react";
import { getPercentString } from "../utils/util";
import { CategoryGroup } from "../model/category";
import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";

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
    const percUnused = 0;
    // catList.reduce((prev, curr) => {
    //   return prev + curr.percentIncome;
    // }, 0);

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
          <div className="font-bold text-2xl text-color-primary">
            No Categories Selected
          </div>
        </div>
      );
    }

    return (
      <>
        {catList.map((grp: any, i) => {
          if (grp.adjustedAmtPlusExtra == 0) return null;
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
                  getPercentString(grp.percentIncome, 0) +
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
            {"(" + getPercentString(1 - percUnused, 0) + ") Unused"}
          </div>
        </div>
      </>
    );
  };

  const categoryList: any[] = [];
  const categoriesWithAmounts = categoryList.filter(
    (grp) => grp.adjustedAmtPlusExtra > 0
  );

  return (
    <div className="p-2 flex flex-col">
      <div className="font-cinzel text-center text-3xl text-color-primary mb-2">
        Budget Helper
      </div>
      <div className="sm:mb-1">
        <Amounts />
      </div>
      <div className="hidden sm:block sm:my-1">
        <BudgetHelperCharts />
      </div>

      <div
        className={`p-1 mt-4 flex-grow ${
          categoriesWithAmounts.length > 0
            ? "sm:grid grid-flow-col"
            : "sm:block"
        }`}
        style={{
          gridTemplateRows: "repeat(8, minmax(0, 1fr))",
        }}
      >
        {getLegendGrid(categoriesWithAmounts, 8)}
      </div>
    </div>
  );
}

export default BudgetHelperWidget;
