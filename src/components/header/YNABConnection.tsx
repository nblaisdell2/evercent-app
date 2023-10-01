import React from "react";
import useModal from "../../hooks/useModal";
import { useSQLMutation } from "../../hooks/useSQLMutation";
import { Budget, connectToYNAB } from "../../model/budget";
import MyIcon from "../elements/MyIcon";
import Label from "../elements/Label";
import ModalContent from "../modals/ModalContent";
import BudgetsListModal from "../modals/BudgetsListModal";
import SkeletonLoader from "tiny-skeleton-loader-react";

import LabelAndValue from "../elements/LabelAndValue";

export function YNABConnectButton({ userID }: { userID: string }) {
  const { mutate: connect, error: connectError } = useSQLMutation(
    ["connect-to-ynab"],
    connectToYNAB(userID)
  );

  return (
    <a onClick={() => connect()}>
      <div className="ml-0 sm:ml-2 flex items-center space-x-1 underline sm:no-underline hover:underline hover:cursor-pointer hover:text-blue-400">
        <div className="font-bold text-3xl sm:text-base">Connect to YNAB</div>
        <MyIcon
          iconType={"GoToIcon"}
          className="h-12 sm:h-6 w-12 sm:w-6 stroke-2"
        />
      </div>
    </a>
  );
}

function YNABConnection({
  isLoading,
  userID,
  budget,
}: {
  isLoading: boolean;
  userID: string;
  budget: Budget | undefined;
}) {
  const { isOpen, showModal, closeModal } = useModal();

  const openBudgetURL = (budgetID: string) => {
    return "https://app.ynab.com/" + budgetID.toLowerCase() + "/budget";
  };

  return (
    <div className="ml-5 min-w-[250px]">
      {isLoading ? (
        <LabelAndValue
          label={"Current Budget"}
          value={"Test"}
          isLoading={isLoading}
        />
      ) : !budget ? (
        <div className="h-full flex justify-center items-center ">
          <YNABConnectButton userID={userID} />
        </div>
      ) : (
        <>
          <div className="text-center">
            <Label label={"Current Budget"} className={"text-lg"} />
            <div className="flex justify-center space-x-1 -mt-[1px]">
              <div className="font-bold ">{budget.name}</div>
              <MyIcon
                iconType={"EditIcon"}
                className="h-6 w-6 stroke-2 hover:cursor-pointer "
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
                    className="h-6 w-6 stroke-2 hover:cursor-pointer "
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
