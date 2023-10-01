import React, { useEffect, useState } from "react";
import Card from "../elements/Card";
import { Budget, getBudgetsList, switchBudget } from "../../model/budget";
import { useSQLQuery } from "../../hooks/useSQLQuery";
import { useSQLMutation } from "../../hooks/useSQLMutation";
import MyButton from "../elements/MyButton";
import LabelAndValue from "../elements/LabelAndValue";
import { log } from "../../utils/log";
import WidgetLoader from "../other/WidgetLoader";

function BudgetsListModal({
  userID,
  budget,
}: {
  userID: string;
  budget: Budget;
}) {
  const [newBudget, setNewBudget] = useState<any>({
    id: budget.id,
    name: budget.name,
  });

  const { data, isLoading, isError } = useSQLQuery(
    "get-budgets-list",
    getBudgetsList(userID)
  );

  const { mutate: changeBudget, data: changeBudgetData } = useSQLMutation(
    ["switch-budget"],
    switchBudget(userID, newBudget?.id)
  );

  useEffect(() => {
    if (
      changeBudgetData &&
      changeBudgetData.status == "Budgets switched successfully!"
    ) {
      window.location.reload();
    }
  }, [changeBudgetData]);

  return (
    <div className="h-full flex flex-col space-y-4 items-center  pb-4">
      <LabelAndValue
        label={"Current Budget"}
        classNameLabel="mt-6"
        value={budget.name}
        classNameValue="-mt-1 text-2xl font-bold"
      />

      <div className={`mt-2 flex-grow w-full flex flex-col px-2`}>
        {!data ? (
          <WidgetLoader />
        ) : (
          <Card className="h-full text-left flex-grow overflow-y-auto">
            {data.map((budget: any) => {
              return (
                <div
                  key={budget.id}
                  onClick={() => {
                    setNewBudget(budget);
                  }}
                  className={`p-1 m-1 font-semibold text-xl rounded-md hover:cursor-pointer ${
                    newBudget?.name == budget.name
                      ? "color-accent text-[#F6F9FA]"
                      : " color-accent-hover"
                  }`}
                >
                  {budget.name}
                </div>
              );
            })}
          </Card>
        )}
      </div>

      <MyButton
        disabled={newBudget?.name == budget.name}
        buttonText={"Switch Budget"}
        onClick={async () => {
          if (newBudget?.name !== budget.name) {
            changeBudget();
          }
        }}
      />
    </div>
  );
}

export default BudgetsListModal;
