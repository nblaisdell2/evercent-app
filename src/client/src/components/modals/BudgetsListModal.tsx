import React, { useEffect, useState } from "react";
import Card from "../elements/Card";
import MyButton from "../elements/MyButton";
import LabelAndValue from "../elements/LabelAndValue";
import WidgetLoader from "../other/WidgetLoader";
import useEvercent from "../../hooks/useEvercent";
import { ModalProps } from "../../hooks/useModal";
import { trpc } from "../../utils/trpc";
import { Budget } from "evercent/dist/budget";

function BudgetsListModal({
  userID,
  budget,
  modalProps,
}: {
  userID: string;
  budget: Budget;
  modalProps: ModalProps;
}) {
  const [newBudget, setNewBudget] = useState({
    id: budget.id,
    name: budget.name,
  });

  const changeBudget = useEvercent().changeBudget();

  // const update = useSaveModal(modalProps, changeBudget, { userID, newBudgetID: newBudget?.id });

  const { data, isLoading, isError } = trpc.budget.getBudgetsList.useQuery({
    userID,
  });
  // const { data, isLoading, isError } = useSQLQuery(
  //   "get-budgets-list",
  //   getBudgetsList(userID)
  // );

  const update = async () => {
    if (newBudget?.name !== budget.name) {
      modalProps.setModalIsSaving(true);

      changeBudget.mutate({ userID, newBudgetID: newBudget?.id });

      modalProps.setModalIsSaving(false);

      window.location.reload();
    }
  };

  useEffect(() => {
    modalProps.setOnSaveFn(() => update);
    if (changeBudget?.data?.data?.newBudgetID) {
      window.location.reload();
    }
  }, [changeBudget.data]);

  return (
    <div className="h-full flex flex-col space-y-4 items-center  pb-4">
      <LabelAndValue
        label={"Current Budget"}
        classNameLabel="mt-6"
        value={budget.name}
        classNameValue="-mt-1 text-2xl font-bold"
      />

      <div className={`mt-2 flex-grow w-full flex flex-col px-2`}>
        {isLoading ? (
          <WidgetLoader />
        ) : (
          <Card className="h-full text-left flex-grow overflow-y-auto">
            {data?.data &&
              data.data.map((budget: any) => {
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
        onClick={update}
      />
    </div>
  );
}

export default BudgetsListModal;
