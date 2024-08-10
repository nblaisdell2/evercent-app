import React from "react";
import useModal from "../../hooks/useModal";
import { getMoneyString } from "../../utils/util";
import LabelAndValue from "../elements/LabelAndValue";
import MyIcon from "../elements/MyIcon";
import ModalContent from "../modals/ModalContent";
import { differenceInDays, startOfToday, parseISO, format } from "date-fns";
import UpdateUserDetailsModal from "../modals/UpdateUserDetailsModal";
import useEvercent from "../../hooks/useEvercent";
import { UserData } from "evercent/dist/user";

function UserDetails() {
  const getUserData = (userData: UserData | null | undefined) => {
    if (!userData)
      return {
        monthlyIncome: 0,
        nextPaydate: new Date().toISOString(),
        payFrequency: "",
      };
    return userData;
  };

  const getDaysAwayString = (daysAway: number) => {
    return "(" + daysAway + " " + (daysAway == 1 ? "day" : "days") + ")";
  };

  const { isLoading, userData } = useEvercent();
  const modalProps = useModal({});

  const { monthlyIncome, nextPaydate, payFrequency } = getUserData(userData);

  const daysAwayFromPayday = differenceInDays(
    parseISO(nextPaydate),
    startOfToday()
  );

  const formattedDate = format(parseISO(nextPaydate), "MM/dd/yyyy");

  return (
    <>
      <div className="flex items-center justify-evenly w-full sm:w-auto sm:space-x-4 text-center">
        {/* Monthly Income */}
        <div className="flex flex-col items-center justify-start sm:justify-center h-full">
          <LabelAndValue
            label={"Monthly Income"}
            value={getMoneyString(monthlyIncome)}
            isLoading={isLoading}
            classNameLabel={"text-sm sm:text-md"}
            classNameValue={"text-xl"}
            classNameValueColor={"text-green-500"}
          />
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-full bg-gray-400" />

        {/* Pay Frequency */}
        <div className="flex flex-col items-center h-full justify-start sm:justify-center">
          <LabelAndValue
            label={"Pay Frequency"}
            value={monthlyIncome == 0 ? "----" : payFrequency}
            isLoading={isLoading}
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
                    : formattedDate +
                      " " +
                      getDaysAwayString(daysAwayFromPayday)}
                </div>
                <div className="block sm:hidden font-bold text-sm sm:text-base">
                  {monthlyIncome == 0 ? (
                    "----"
                  ) : (
                    <div>
                      <div>{formattedDate}</div>
                      <div className="text-xs sm:text-base -mt-1 sm:mt-0">
                        {getDaysAwayString(daysAwayFromPayday)}
                      </div>
                    </div>
                  )}
                </div>
              </>
            }
            isLoading={isLoading}
            classNameLabel={"text-sm sm:text-md"}
            classNameValue={"text-md"}
          />
        </div>

        {!isLoading && (
          <>
            {/* Vertical Divider */}
            <div className="w-[1px] h-full bg-gray-400" />

            {/* Edit Icon */}
            <MyIcon
              iconType={"EditIcon"}
              className=" h-6 w-6 sm:h-8 sm:w-8 -mr-1 sm:mr-0 stroke-2 hover:cursor-pointer"
              onClick={modalProps.showModal}
            />
          </>
        )}
      </div>

      <ModalContent
        fullScreen={false}
        modalTitle={"User Details"}
        modalProps={modalProps}
        closeOnSave={true}
      >
        <UpdateUserDetailsModal
          userData={userData as UserData}
          modalProps={modalProps}
        />
      </ModalContent>
    </>
  );
}

export default UserDetails;
