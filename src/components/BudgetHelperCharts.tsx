import React, { useState } from "react";
import Chart, {
  GoogleChartOptions,
  GoogleDataTable,
  ReactGoogleChartEvent,
} from "react-google-charts";
import { getMoneyString } from "../utils/util";
import { CategoryGroup } from "../model/category";

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

const getChartTooltip = (name: string, amount: number) => {
  return (
    '<div style="width: 200px; padding: 3px;">' +
    '<span style="font-size: 1rem; font-weight: bold;">' +
    name +
    "<span>" +
    "<br/>" +
    '<span style="font-weight: normal; color: green; font-weight: bold;">' +
    getMoneyString(amount, 2) +
    "</span>" +
    "</div>"
  );
};

function BudgetHelperCharts() {
  const [selectedGroup, setSelectedGroup] = useState<{
    groupID: string;
    groupName: string;
  }>({
    groupID: "",
    groupName: "",
  });

  const getChartData = (
    categoryList: CategoryGroup[],
    monthlyIncome: number,
    chartType: string,
    other?: string
  ) => {
    let myChartData;
    if (chartType == "group") {
      if (other && other == "pie") {
        myChartData = categoryList.reduce(
          (prev: any, curr: any) => {
            if (curr.adjustedAmtPlusExtra > 0) {
              return [...prev, [curr.groupName, curr.adjustedAmtPlusExtra]];
            }
            return prev;
          },
          [["Category Group", "Amount Used"] as string[]]
        );
      } else {
        myChartData = categoryList.reduce(
          (prev: any, curr: any) => {
            if (curr?.adjustedAmtPlusExtra > 0) {
              prev[0] = [
                ...prev[0],
                curr.groupName,
                { role: "tooltip", type: "string", p: { html: true } },
              ];
              prev[1] = [
                ...prev[1],
                curr.adjustedAmtPlusExtra / monthlyIncome,
                getChartTooltip(curr.groupName, curr.adjustedAmtPlusExtra),
              ];
            }
            return prev;
          },
          [[] as any[], [] as any[]]
        );
      }
    } else {
      let chartRemainder = monthlyIncome;
      if (selectedGroup.groupID != "") {
        chartRemainder = 0;
        // categoryList
        //   .filter((grp) => grp.groupID == selectedGroup.groupID)[0]
        //   .categories.reduce((prev, curr) => {
        //     return prev + curr.adjustedAmtPlusExtra;
        //   }, 0);
      }
      // myChartData = (
      //   merge(categoryList, "categories") as CategoryListItem[]
      // ).reduce(
      //   (prev, curr) => {
      //     if (
      //       curr?.adjustedAmtPlusExtra > 0 &&
      //       (selectedGroup.groupID == "" ||
      //         curr.categoryGroupID == selectedGroup.groupID)
      //     ) {
      //       prev[0] = [
      //         ...prev[0],
      //         curr.name,
      //         { role: "tooltip", type: "string", p: { html: true } },
      //       ];
      //       prev[1] = [
      //         ...prev[1],
      //         curr.adjustedAmtPlusExtra / chartRemainder,
      //         getChartTooltip(curr.name, curr.adjustedAmtPlusExtra),
      //       ];
      //     }
      //     return prev;
      //   },
      //   [[] as any[], [] as any[]]
      // );
    }

    let remainder = monthlyIncome - 0; //getTotalAmountUsed(categoryList);
    if (other == "pie") {
      myChartData.push(["Unused", remainder]);
    } else {
      myChartData[0] = ["", ...myChartData[0]];
      myChartData[1] = ["", ...myChartData[1]];

      if (
        chartType == "group" ||
        (chartType == "category" && !selectedGroup.groupID)
      ) {
        myChartData[0] = [
          ...myChartData[0],
          "Unused",
          { role: "tooltip", type: "string", p: { html: true } },
        ];
        myChartData[1] = [
          ...myChartData[1],
          remainder / monthlyIncome,
          getChartTooltip("Unused", remainder),
        ];
      }
    }

    return myChartData;
  };

  const chartEvents: ReactGoogleChartEvent[] = [
    {
      eventName: "select",
      callback: ({ chartWrapper }) => {
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();
        if (selection.length === 1) {
          const [selectedItem] = selection;
          const dataTable = chartWrapper.getDataTable() as GoogleDataTable;
          const { row, column } = selectedItem as any;

          const colName = dataTable.getColumnLabel(column) || "";
          const colID = 0;
          // categoryList.find((catGroup: CategoryGroup) => {
          //   return catGroup.groupName == colName;
          // })?.categories[0].categoryGroupID || "";

          // setSelectedGroup((prev) => {
          //   if (prev.groupID == colID || colName == "Unused") {
          //     return {
          //       groupID: "",
          //       groupName: "",
          //     };
          //   }
          //   return {
          //     groupID: colID,
          //     groupName: colName,
          //   };
          // });

          // console.log("You selected:", {
          //   row,
          //   column,
          //   colName: colName,
          //   colID: colID,
          //   value: dataTable?.getValue(row, column),
          // });
        }
      },
    },
  ];

  const chartOptions = {
    chartArea: { width: "100%", height: "100%", left: "5" },
    tooltip: {
      isHtml: true,
    },
    bar: { groupWidth: "100%" },
    isStacked: true,
    legend: "none",
    backgroundColor: "transparent",
    hAxis: {
      baselineColor: "transparent",
      textPosition: "none",
      gridlines: { count: 0 },
    },
    animation: {
      startup: true,
      easing: "inAndOut",
      duration: 1500,
    },
  };

  const chartOptionsPie = {
    chartArea: { width: "100%", height: "90%" },
    legend: "none",
    pieHole: 0.5,
    pieSliceBorderColor: "transparent",
    backgroundColor: "transparent",
    animation: {
      startup: true,
      easing: "inAndOut",
      duration: 1500,
    },
  };

  // const chartDataGroup = getChartData(categoryList, monthlyIncome, "group");
  // const chartDataGroupPie = getChartData(
  //   categoryList,
  //   monthlyIncome,
  //   "group",
  //   "pie"
  // );
  // const chartDataCategory = getChartData(
  //   categoryList,
  //   monthlyIncome,
  //   "category"
  // );
  // console.log("chartDataCategory", chartDataCategory);

  let groupColors: any[] = [];
  // for (let i = 1; i < (chartDataGroup[0].length - 1) / 2; i++) {
  //   groupColors.push(
  //     !selectedGroup.groupID ||
  //       selectedGroup.groupName == chartDataGroup[0][i * 2 - 1]
  //       ? CHART_COLORS[Math.floor(selectedGroup.groupID ? i - 1 : i - 1)]
  //       : "#C0C0C0"
  //   );
  // }
  const type: string = "widget";
  // console.log("groupColors", groupColors);

  return (
    <>
      <div className="hidden sm:block">
        {/* <div>
          {type == "full" && (
            <div className="p-1 font-bold">By Category Group</div>
          )}
          <Chart
            chartType="BarChart"
            width={"100%"}
            height={"115px"}
            // data={chartDataGroup}
            options={{
              ...chartOptions,
              colors: [...groupColors, "#A0A0A0"],
            }}
            chartEvents={chartEvents}
          />
        </div> */}
        {/* {type == "full" && (
          <div>
            <div className="p-1 font-bold">
              By Category{" "}
              {selectedGroup.groupName && " - " + selectedGroup.groupName}
            </div>
            <Chart
              chartType="BarChart"
              width={"100%"}
              height={"115px"}
              // data={chartDataCategory}
              // options={{
              //   ...chartOptions,
              //   colors: [
              //     ...CHART_COLORS.slice(
              //       0,
              //       chartDataCategory[0].length / 2 -
              //         (!selectedGroup.groupID ? 1 : 0)
              //     ),
              //     "#A0A0A0",
              //   ],
              // }}
            />
          </div>
        )} */}
      </div>
      {/* <div className="block sm:hidden">
        <div>
          <Chart
            chartType="PieChart"
            width={"100%"}
            height={"250px"}
            // data={chartDataGroupPie}
            // options={{
            //   ...chartOptionsPie,
            //   colors: [
            //     ...CHART_COLORS.slice(0, chartDataGroupPie.length - 2),
            //     "#A0A0A0",
            //   ],
            // }}
          />
        </div>
      </div> */}
    </>
  );
}

export default BudgetHelperCharts;
