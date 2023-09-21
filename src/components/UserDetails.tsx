import React from "react";

import { PencilSquareIcon } from "@heroicons/react/24/outline";

import LabelAndValue from "./elements/LabelAndValue";
import { getMoneyString } from "../utils/util";
import { PayFrequency } from "../model/userData";
// import { UserData } from "../../../utils/evercent";
// import useModal from "../../hooks/useModal";
// import {
//   formatDate,
//   getMoneyString,
//   ModalType,
//   parseDate,
// } from "../../../utils/utils";
// import ModalContent from "../../modal/ModalContent";
// import UpdateUserDetailsModal from "../../modal/UpdateUserDetailsModal";
// import LabelAndValue from "../../elements/LabelAndValue";
// import { QueryLoadingState } from "../../hooks/useEvercent";

function UserDetails() {
  // }
  // function UserDetails({
  //   userData,
  //   updateUserData,
  //   queryLoading,
  // }: {
  //   userData: UserData;
  //   updateUserData: (newUserData: UserData) => Promise<void>;
  //   queryLoading: QueryLoadingState;
  // }) {
  // const { isOpen, showModal, closeModal } = useModal();

  // const { monthlyIncome, nextPaydate, payFrequency } = userData;
  // const daysAwayFromPayday = differenceInDays(
  //   parseDate(nextPaydate),
  //   startOfToday()
  // );

  const monthlyIncome: number = 123.45;
  const payFrequency: PayFrequency = "Every 2 Weeks";
  const nextPaydate: string = new Date().toISOString();
  const daysAwayFromPayday: number = 3;

  return (
    <>
      <div className="flex items-center justify-evenly w-full sm:w-auto sm:space-x-4 text-center">
        {/* Monthly Income */}
        <div className="flex flex-col items-center justify-start sm:justify-center h-full">
          <LabelAndValue
            label={"Monthly Income"}
            value={getMoneyString(monthlyIncome)}
            classNameLabel={"text-sm sm:text-md"}
            classNameValue={"text-xl text-green-500"}
          />
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-full bg-gray-400" />

        {/* Pay Frequency */}
        <div className="flex flex-col items-center h-full justify-start sm:justify-center">
          <LabelAndValue
            label={"Pay Frequency"}
            value={monthlyIncome == 0 ? "----" : payFrequency}
            classNameLabel={"text-sm sm:text-md"}
            classNameValue={"text-md"}
          />
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-full bg-gray-400" />

        {/* Next Paydate */}
        <div className="flex flex-col items-center h-full justify-start sm:justify-center">
          <LabelAndValue
            label={"Next Paydate"}
            value={
              <>
                <div className="hidden sm:block font-bold text-sm sm:text-base">
                  {monthlyIncome == 0
                    ? "----"
                    : nextPaydate +
                      " (" +
                      daysAwayFromPayday +
                      " " +
                      (daysAwayFromPayday == 1 ? "day" : "days") +
                      ")"}
                </div>
                <div className="block sm:hidden font-bold text-sm sm:text-base">
                  {monthlyIncome == 0 ? (
                    "----"
                  ) : (
                    <div>
                      <div>{nextPaydate}</div>
                      <div className="text-xs sm:text-base -mt-1 sm:mt-0">
                        {"(" +
                          daysAwayFromPayday +
                          " " +
                          (daysAwayFromPayday == 1 ? "day" : "days") +
                          ")"}
                      </div>
                    </div>
                  )}
                </div>
              </>
            }
            classNameLabel={"text-sm sm:text-md"}
            classNameValue={"text-md"}
          />
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-full bg-gray-400" />

        {/* Edit Icon */}
        <PencilSquareIcon
          className="h-6 w-6 sm:h-8 sm:w-8 -mr-1 sm:mr-0 stroke-2 hover:cursor-pointer"
          // onClick={showModal}
        />
      </div>

      {/* {isOpen && (
        <ModalContent
          modalContentID={ModalType.USER_DETAILS}
          onClose={closeModal}
        >
          <UpdateUserDetailsModal
            userData={userData}
            queryLoading={queryLoading}
            updateUserData={updateUserData}
            closeModal={closeModal}
          />
        </ModalContent>
      )} */}
    </>
  );
}

export default UserDetails;
