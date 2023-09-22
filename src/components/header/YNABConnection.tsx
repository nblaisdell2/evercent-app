import React from "react";
import useModal from "../../hooks/useModal";
import { useSQLMutation } from "../../hooks/useSQLMutation";
import { Budget, connectToYNAB } from "../../model/budget";
import MyIcon from "../elements/MyIcon";
import Label from "../elements/Label";
import ModalContent from "../modals/ModalContent";
import BudgetsListModal from "../modals/BudgetsListModal";

function YNABConnection({
  userID,
  budget,
}: {
  userID: string;
  budget: Budget | null | undefined;
}) {
  const { isOpen, showModal, closeModal } = useModal();

  const { mutate: connect, error: connectError } = useSQLMutation(
    ["connect-to-ynab"],
    connectToYNAB(userID)
  );

  const openBudgetURL = (budgetID: string) => {
    return "https://app.ynab.com/" + budgetID.toLowerCase() + "/budget";
  };

  return (
    <div className="ml-5">
      {!budget ? (
        <div className="flex flex-col sm:flex-row items-center text-color-primary">
          <div className="block sm:hidden text-center font-semibold text-xl">
            <div className="mb-4 px-6">
              Please click the button below to connect Evercent to your YNAB
              Budget account.
            </div>
            <div className="mb-4 px-6">
              This will allow Evercent to pull in all of the categories from
              your budget for planning, automation, etc.
            </div>
          </div>

          <a onClick={() => connect()}>
            <div className="ml-0 sm:ml-2 flex items-center space-x-1 underline sm:no-underline hover:underline hover:cursor-pointer hover:text-blue-400">
              <div className="font-bold text-3xl sm:text-base">
                Connect to YNAB
              </div>
              <MyIcon
                iconType={"GoToIcon"}
                className="h-12 sm:h-6 w-12 sm:w-6 stroke-2"
              />
            </div>
          </a>
        </div>
      ) : (
        <>
          <div className="text-center ml-4">
            <Label label={"Current Budget"} className={"text-lg"} />
            <div className="flex justify-center space-x-1 -mt-[1px]">
              <div className="font-bold text-color-primary">{budget.name}</div>
              <MyIcon
                iconType={"EditIcon"}
                className="h-6 w-6 stroke-2 hover:cursor-pointer text-color-primary"
                onClick={showModal}
              />

              <div>
                <a
                  target="_blank"
                  href={openBudgetURL(budget.id)}
                  rel="noopener noreferrer"
                >
                  <MyIcon
                    iconType={"GoToIcon"}
                    className="h-6 w-6 stroke-2 hover:cursor-pointer text-color-primary"
                  />
                </a>
              </div>
            </div>
          </div>

          {isOpen && (
            <ModalContent
              fullScreen={false}
              modalTitle={"Budgets List"}
              onClose={closeModal}
            >
              <BudgetsListModal userID={userID} budget={budget} />
            </ModalContent>
          )}
        </>
      )}
    </div>
  );
}

export default YNABConnection;
