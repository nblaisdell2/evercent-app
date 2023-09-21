import React from "react";

import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import LabelAndValue from "./elements/LabelAndValue";
import Label from "./elements/Label";

function YNABConnection() {
  return (
    <div className="flex">
      <>
        <div className="flex">
          <div className="hidden sm:block text-center mr-4">
            <LabelAndValue
              label={"API Connection"}
              value={
                <div
                  className={`${"bg-green-600"} text-white font-semibold rounded-full px-4 mt-1`}
                >
                  {"Disconnected"}
                </div>
              }
            />
          </div>

          {true ? (
            <>
              <div className="text-center ml-4">
                <Label label={"Current Budget"} className={"text-lg"} />
                <div className="flex justify-center space-x-1 -mt-[1px]">
                  <div className="font-bold text-color-primary">
                    {"TODO: Budget Name"}
                  </div>
                  <PencilSquareIcon
                    className="h-6 w-6 stroke-2 hover:cursor-pointer text-color-primary"
                    // onClick={showModal}
                  />

                  <div>
                    <a target="_blank" href={"#"} rel="noopener noreferrer">
                      <ArrowTopRightOnSquareIcon className="h-6 w-6 stroke-2 hover:cursor-pointer text-color-primary" />
                    </a>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center">
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

              <a href={"#"}>
                <div className="ml-0 sm:ml-2 flex items-center space-x-1 underline sm:no-underline hover:underline hover:cursor-pointer hover:text-blue-400">
                  <div className="font-bold text-3xl sm:text-base">
                    Connect to YNAB
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-12 sm:h-6 w-12 sm:w-6 stroke-2" />
                </div>
              </a>
            </div>
          )}
        </div>

        {/* {isOpen && (
            <ModalContent
                modalContentID={ModalType.CHANGE_BUDGET}
                onClose={closeModal}
            >
                <ChangeBudgetModal
                budgetNames={budgetNames}
                userData={userData}
                queryLoading={queryLoading}
                updateDefaultBudgetID={updateDefaultBudgetID}
                />
            </ModalContent>
            )} */}
      </>
    </div>
  );
}

export default YNABConnection;
