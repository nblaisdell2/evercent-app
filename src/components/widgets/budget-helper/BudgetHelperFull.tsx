import React from "react";
import Amounts from "./Amounts";
import BudgetHelperCharts from "./BudgetHelperCharts";
import CategoryList from "./CategoryList";
import SelectedCategory from "./SelectedCategory";

import useBudgetHelper from "../../../hooks/useBudgetHelper";
import { log } from "../../../utils/log";
import { WidgetProps } from "../../MainContent";
import { CategoryGroup, ExcludedCategory } from "../../../model/category";

function BudgetHelperFull({ widgetProps }: { widgetProps?: WidgetProps }) {
  log("RENDERING [BudgetHelperFull.tsx]", { widgetProps });

  const bhProps = useBudgetHelper(widgetProps);
  // log("What are the bhProps", bhProps);
  // log("category list data", bhProps.hierarchyProps.listData);

  return (
    <div className="h-full mx-4 pb-2 flex flex-col">
      <Amounts
        monthlyIncome={bhProps.monthlyIncome as number}
        categoryGroups={bhProps.categoryList}
        type="full"
      />

      <BudgetHelperCharts
        monthlyIncome={bhProps.monthlyIncome as number}
        categoryGroups={bhProps.categoryList}
        type="full"
      />

      {!bhProps.selectedCategory ? (
        <CategoryList bhProps={bhProps} />
      ) : (
        <SelectedCategory bhProps={bhProps} />
      )}
    </div>
  );
}

export default BudgetHelperFull;
