import React from "react";
import BudgetHelperWidget from "./BudgetHelperWidget";
import BudgetAutomationWidget from "./BudgetAutomationWidget";
import RegularExpensesWidget from "./RegularExpensesWidget";
import UpcomingExpensesWidget from "./UpcomingExpensesWidget";
import Card from "./elements/Card";

function MainContent() {
  return (
    <div className="w-full h-full flex flex-col sm:flex-row flex-nowrap sm:flex-wrap justify-center">
      <div className="grid grid-cols-2 grid-rows-2 gap-4 w-[90%] p-2">
        <Card>
          <BudgetHelperWidget />
        </Card>
        <Card>
          <BudgetAutomationWidget />
        </Card>
        <Card>
          <RegularExpensesWidget />
        </Card>
        <Card>
          <UpcomingExpensesWidget />
        </Card>
      </div>
    </div>
  );
}

export default MainContent;
