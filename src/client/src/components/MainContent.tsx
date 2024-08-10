import React, { cloneElement } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useEvercent from "../hooks/useEvercent";
import useModal, { ModalProps } from "../hooks/useModal";
import ModalContent from "./modals/ModalContent";
import SignInMessage from "./other/SignInMessage";
import { log } from "../utils/log";

import Card from "./elements/Card";
import WidgetLoader from "./other/WidgetLoader";
import { YNABConnectButton } from "./header/YNABConnection";
import BudgetHelperFull from "./widgets/budget-helper/BudgetHelperFull";
import BudgetHelperWidget from "./widgets/budget-helper/BudgetHelperWidget";
import BudgetAutomationWidget from "./widgets/budget-automation/BudgetAutomationWidget";
import RegularExpensesWidget from "./widgets/regular-expenses/RegularExpensesWidget";
import UpcomingExpensesWidget from "./widgets/upcoming-expenses/UpcomingExpensesWidget";
import UpcomingExpensesFull from "./widgets/upcoming-expenses/UpcomingExpensesFull";
import BudgetAutomationFull from "./widgets/budget-automation/BudgetAutomationFull";
import RegularExpensesFull from "./widgets/regular-expenses/RegularExpensesFull";
import { PayFrequency } from "evercent/dist/user";
import { Budget, FAKE_BUDGET_ID } from "evercent/dist/budget";
import {
  getAllCategories,
  getAllCategoriesRegularExpenses,
  getUpcomingCategories,
} from "evercent/dist/category";

export type WidgetProps = Pick<
  ModalProps,
  | "changesMade"
  | "setChangesMade"
  | "setOnSaveFn"
  | "setModalIsSaving"
  | "closeModal"
>;

function Widget({
  name,
  widgetComponent,
  fullComponent,
}: {
  name: string;
  widgetComponent: JSX.Element;
  fullComponent: JSX.Element;
}) {
  const { isLoading, userData, budget, categoryGroups } = useEvercent();
  const modalProps = useModal({});

  const shouldOpenWidget =
    !isLoading &&
    (name == "Budget Helper" ||
      (name == "Budget Automation" &&
        getAllCategories(categoryGroups || [], false).filter(
          (c) => c.adjustedAmountPlusExtra > 0
        ).length > 0) ||
      (name == "Regular Expenses" &&
        getAllCategoriesRegularExpenses(categoryGroups || [], false).length >
          0) ||
      (name == "Upcoming Expenses" &&
        getUpcomingCategories(
          budget as Budget,
          categoryGroups || [],
          userData?.payFrequency as PayFrequency,
          userData?.nextPaydate as string
        ).length > 0));

  return (
    <>
      <Card
        onClick={() => {
          if (!shouldOpenWidget) return;
          modalProps.showModal();
        }}
        className={`flex flex-col p-4 ${
          !shouldOpenWidget ? "hover:cursor-default" : "hover:cursor-pointer"
        }`}
      >
        <div className="font-cinzel text-center text-3xl  mb-2">{name}</div>

        {isLoading ? (
          <WidgetLoader />
        ) : (
          <div className="flex-grow">{widgetComponent}</div>
        )}
      </Card>

      <ModalContent
        fullScreen={true}
        modalTitle={name}
        modalProps={modalProps}
        closeOnSave={name == "Budget Automation"}
      >
        {["Budget Helper", "Budget Automation", "Regular Expenses"].includes(
          name
        )
          ? cloneElement(fullComponent, {
              widgetProps: {
                changesMade: modalProps.changesMade,
                setChangesMade: modalProps.setChangesMade,
                setOnSaveFn: modalProps.setOnSaveFn,
                setModalIsSaving: modalProps.setModalIsSaving,
                closeModal: modalProps.closeModal,
              } as WidgetProps,
            })
          : fullComponent}
      </ModalContent>
    </>
  );
}

function MainContent() {
  log("RENDERING [MainContent.tsx]");

  const { isAuthenticated } = useAuth0();
  const { userData } = useEvercent();

  // If the user isn't signed in, show them a message about how to sign in,
  // and a quick overview of how Evercent can be used
  if (!isAuthenticated) return <SignInMessage />;

  // If the user is logged in, but they haven't connected their YNAB budget to
  // Evercent yet, show them another message about connecting to YNAB, which allows
  // them to do so, as well
  if (userData?.budgetID == FAKE_BUDGET_ID) {
    return (
      <div className="h-full flex flex-col space-y-2 justify-center items-center">
        <div>Information about connecting to YNAB</div>
        <YNABConnectButton userID={userData?.userID as string} />
      </div>
    );
  }

  // Finally, at this point, our user is logged in, and their budget is connected,
  // so we should be able to load their Evercent details with no issue

  return (
    <>
      <div className="h-full w-full flex justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-4 p-2 w-[85%]">
          <Widget
            name={"Budget Helper"}
            widgetComponent={<BudgetHelperWidget />}
            fullComponent={<BudgetHelperFull />}
          />
          <Widget
            name={"Budget Automation"}
            widgetComponent={<BudgetAutomationWidget />}
            fullComponent={<BudgetAutomationFull />}
          />
          <Widget
            name={"Regular Expenses"}
            widgetComponent={<RegularExpensesWidget />}
            fullComponent={<RegularExpensesFull />}
          />
          <Widget
            name={"Upcoming Expenses"}
            widgetComponent={<UpcomingExpensesWidget />}
            fullComponent={<UpcomingExpensesFull />}
          />
        </div>
      </div>
    </>
  );
}

export default MainContent;
