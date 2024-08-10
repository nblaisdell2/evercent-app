import React from "react";
import RegularExpenseChart from "./RegularExpenseChart";
import RegularExpenseDetails from "./RegularExpenseDetails";
import RegularExpenseOverview from "./RegularExpenseOverview";
import useModal from "../../../hooks/useModal";
import { WidgetProps } from "../../MainContent";
import { log } from "../../../utils/log";
import useRegularExpenses from "../../../hooks/useRegularExpenses";

function RegularExpensesFull({ widgetProps }: { widgetProps?: WidgetProps }) {
  // log("RENDERING [RegularExpensesFull.tsx]", { widgetProps });

  const reProps = useRegularExpenses(widgetProps as WidgetProps);
  if (!reProps) return;

  log("What are the reProps", reProps);

  return (
    <div className="h-full flex font-mplus p-2 space-x-2">
      <RegularExpenseChart reProps={reProps} />

      <div className="flex flex-col flex-grow space-y-2">
        <RegularExpenseOverview reProps={reProps} />
        <RegularExpenseDetails reProps={reProps} />
      </div>
    </div>
  );
}

export default RegularExpensesFull;
