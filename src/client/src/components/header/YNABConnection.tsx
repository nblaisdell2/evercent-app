import React, { useEffect } from "react";
import useModal from "../../hooks/useModal";
import MyIcon from "../elements/MyIcon";
import Label from "../elements/Label";
import ModalContent from "../modals/ModalContent";
import BudgetsListModal from "../modals/BudgetsListModal";

import LabelAndValue from "../elements/LabelAndValue";
import useEvercent from "../../hooks/useEvercent";
import { GetURL_YNABBudget } from "evercent/dist/ynab";

export function YNABConnectButton({ userID }: { userID: string }) {
  const { mutate, data } = useEvercent().connectToYNAB();

  useEffect(() => {
    if (data?.data) window.location.href = data.data;
  }, [data]);

  return (
    <a onClick={() => mutate({ userID })}>
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

function YNABConnection() {
  const { isLoading, userData, budget } = useEvercent();
  const modalProps = useModal({
    loadingText: "Loading New Budget Details...",
    savedText: "Reloading...",
  });

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
          <YNABConnectButton userID={userData?.userID as string} />
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
                onClick={modalProps.showModal}
              />

              <div>
                <a
                  target="_blank"
                  href={GetURL_YNABBudget(budget.id)}
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

          <ModalContent
            fullScreen={false}
            modalTitle={"Budgets List"}
            modalProps={modalProps}
          >
            <BudgetsListModal
              userID={userData?.userID as string}
              budget={budget}
              modalProps={modalProps}
            />
          </ModalContent>
        </>
      )}
    </div>
  );
}

export default YNABConnection;
