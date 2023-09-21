import React from "react";

function RegularExpensesWidget() {
  if (true) {
    return (
      <div className="font-bold text-2xl text-center">
        Use the <span className="font-cinzel text-3xl">Budget Helper</span>{" "}
        widget, and mark some categories as a <u>Regular Expense</u> to see
        those details here.
      </div>
    );
  }

  // const numRegularExpenses = getCategoriesCount(regularExpenses);

  // return (
  //   <div className="h-full w-full flex flex-col justify-evenly">
  //     <LabelAndValue
  //       label={"# of Regular Expenses"}
  //       value={numRegularExpenses}
  //       classNameValue={"text-4xl sm:text-6xl"}
  //     />
  //     <LabelAndValue
  //       label={"Categories with Target Met"}
  //       value={
  //         <div className="flex items-center">
  //           <div className="text-4xl sm:text-6xl">
  //             {numExpensesWithTargetMet}
  //           </div>
  //           <div className="text-xl sm:text-2xl ml-1 sm:ml-2">
  //             {"(" +
  //               calculatePercentString(
  //                 numExpensesWithTargetMet,
  //                 numRegularExpenses
  //               ) +
  //               ")"}
  //           </div>
  //         </div>
  //       }
  //     />
  //   </div>
  // );
}

export default RegularExpensesWidget;
