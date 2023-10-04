import React from "react";
import { WidgetProps } from "../../MainContent";
import AmountMonths from "./AmountMonths";
import AutomationOverview from "./AutomationOverview";
import AutomationSchedule from "./AutomationSchedule";
import UpcomingPastList from "./UpcomingPastList";
import useBudgetAutomation from "../../../hooks/useBudgetAutomation";
import { log } from "../../../utils/log";

function BudgetAutomationFull({ widgetProps }: { widgetProps?: WidgetProps }) {
  log("RENDERING [BudgetAutomationFull.tsx]", { widgetProps });

  const baProps = useBudgetAutomation(widgetProps as WidgetProps);
  log("What are the baProps", baProps);

  return (
    <>
      <div className="flex flex-col h-full w-full">
        <div className="flex h-[25%]">
          {/* Top Left - Upcoming/Past */}
          <div className="w-[65%] p-2">
            <UpcomingPastList baProps={baProps} />
          </div>

          {/* Top Right - Schedule */}
          <div className="w-[35%] p-2">
            <AutomationSchedule baProps={baProps} />
          </div>
        </div>

        <div className="flex flex-grow space-x-2 p-2">
          {/* Bottom Left - Amounts Posted to Budget */}
          <div className="w-[50%]">
            <AmountMonths baProps={baProps} />
          </div>

          {/* Bottom Right - Overview Section */}
          <div className="w-[50%]">
            <AutomationOverview baProps={baProps} />
          </div>
        </div>
      </div>
    </>
  );
}

export default BudgetAutomationFull;
