import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { WidgetProps } from "../components/MainContent";
import useEvercent from "./useEvercent";
import {
  AutoRun,
  AutoRunCategory,
  AutoRunCategoryGroup,
  generateAutoRunCategoryGroups,
  getValidAutoRuns,
} from "../model/autoRun";
import { CheckboxItem } from "../components/elements/HierarchyTable";
import { log } from "../utils/log";
import { PayFrequency, incrementDateByFrequency } from "../model/userData";
import { generateUUID } from "../utils/util";
import { parseISO } from "date-fns";

export type BudgetAutomationState = {
  changesMade: boolean;
  closeWidget: () => void;

  monthlyIncome: number;
  nextPaydate: string;
  payFrequency: PayFrequency;
  autoRuns: AutoRun[];
  pastRuns: AutoRun[];
  nextAutoRun: AutoRun | null;

  selectedPastRun: AutoRun | undefined;
  selectPastRun: Dispatch<SetStateAction<AutoRun>>;
  selectedPastRunCategory: AutoRunCategory;
  selectPastRunCategory: (item: CheckboxItem | null) => void;

  showUpcoming: boolean;
  toggleUpcoming: (doShow: boolean) => void;
  setNewAutomationSchedule: (newTime: string) => void;
  updateToggledAutoRunCategories: (items: CheckboxItem[]) => void;
  saveAutoRunDetails: () => Promise<void>;
  cancelAutomation: () => Promise<void>;
};

function useBudgetAutomation(widgetProps: WidgetProps) {
  const {
    userData,
    categoryGroups,
    autoRuns,
    pastRuns,
    saveAutoRuns,
    cancelAutoRuns,
  } = useEvercent();

  const [showUpcoming, setShowUpcoming] = useState(true);
  const [autoRunsList, setAutoRunsList] = useState<AutoRun[]>(
    getValidAutoRuns(autoRuns)
  );
  const [selectedPastRun, setSelectedPastRun] = useState<AutoRun>();
  const [selectedPastRunCategory, setSelectedPastRunCategory] =
    useState<AutoRunCategory>();

  const toggleUpcoming = (doShow: boolean) => {
    if (doShow) {
      setSelectedPastRun(undefined);
      setSelectedPastRunCategory(undefined);
    } else {
      setSelectedPastRun(
        pastRuns.sort(
          (a, b) =>
            parseISO(b.runTime).getTime() - parseISO(a.runTime).getTime()
        )[0]
      );
    }

    setShowUpcoming(doShow);
  };

  const selectPastRunCategory = (item: CheckboxItem | null) => {
    if (showUpcoming) return;

    if (item == null) {
      setSelectedPastRunCategory(undefined);
      return;
    }

    const grp = pastRuns[0].categoryGroups.filter(
      (g) => g.groupID.toLowerCase() == item.parentId.toLowerCase()
    )[0];
    const cat = grp.categories.filter(
      (c) => c.categoryGUID.toLowerCase() == item.id.toLowerCase()
    )[0];
    setSelectedPastRunCategory(cat);
  };

  const setNewAutomationSchedule = (newTime: string) => {
    let autoRunList: AutoRun[] = [...autoRunsList];
    let dtRunTime = parseISO(newTime);
    for (let i = 0; i < 10; i++) {
      let autoRunGroups: AutoRunCategoryGroup[] = [];
      if (i == 0) {
        autoRunGroups = generateAutoRunCategoryGroups(
          categoryGroups,
          userData?.payFrequency as PayFrequency
        );
      }

      if (autoRunList[i]) {
        autoRunList[i] = {
          ...autoRunList[i],
          runID: autoRunList[i].runID,
          runTime: dtRunTime.toISOString(),
          isLocked: autoRunList[i].isLocked,
          categoryGroups: autoRunGroups,
        };
      } else {
        autoRunList.push({
          runID: generateUUID().toUpperCase(),
          runTime: dtRunTime.toISOString(),
          isLocked: false,
          categoryGroups: autoRunGroups,
        });
      }
      dtRunTime = incrementDateByFrequency(
        dtRunTime,
        userData?.payFrequency as PayFrequency
      );
    }

    setAutoRunsList(autoRunList);
    widgetProps.setChangesMade(true);
  };

  const updateToggledAutoRunCategories = (items: CheckboxItem[]) => {
    if (!showUpcoming) return;

    const newList = autoRunsList.map((run) => {
      return {
        ...run,
        categoryGroups: run.categoryGroups.map((cg) => {
          return {
            ...cg,
            categories: cg.categories.map((c) => {
              const newMonths = c.postingMonths.map((p) => {
                const item = items.filter((itm) => {
                  return (
                    itm.parentId == c.categoryGUID && itm.name == p.postingMonth
                  );
                })[0];
                return {
                  ...p,
                  included: item.selected == undefined ? true : item.selected,
                };
              });
              return {
                ...c,
                postingMonths: newMonths,
                categoryAdjAmountPerPaycheck: newMonths.reduce((prev, curr) => {
                  return prev + (curr.included ? curr.amountToPost : 0);
                }, 0),
              };
            }),
          };
        }),
      };
    });

    setAutoRunsList(newList);
    widgetProps.setChangesMade(true);
  };

  const saveAutoRunDetails = async () => {
    if (!widgetProps.changesMade) {
      widgetProps.closeModal();
      return;
    }

    widgetProps.setModalIsSaving(true);
    await saveAutoRuns({
      userID: userData?.userID as string,
      budgetID: userData?.budgetID as string,
      autoRuns: autoRunsList,
    });
    widgetProps.setModalIsSaving(false);

    widgetProps.setChangesMade(false);
  };

  const cancelAutomation = async () => {
    widgetProps.setModalIsSaving(true);
    await cancelAutoRuns({
      userID: userData?.userID as string,
      budgetID: userData?.budgetID as string,
    });
    widgetProps.setModalIsSaving(false);

    widgetProps.setChangesMade(false);
  };

  useEffect(() => {
    widgetProps.setOnSaveFn(() => saveAutoRunDetails);
  }, [autoRunsList]);

  return {
    monthlyIncome: userData?.monthlyIncome || 0,
    payFrequency: userData?.payFrequency || "Every 2 Weeks",
    nextPaydate: userData?.nextPaydate || new Date().toISOString(),
    changesMade: widgetProps.changesMade,
    closeWidget: widgetProps.closeModal,
    autoRuns: autoRunsList,
    pastRuns,
    nextAutoRun: autoRunsList[0] || null,
    showUpcoming,
    toggleUpcoming,

    selectedPastRun,
    selectPastRun: setSelectedPastRun,
    selectedPastRunCategory,
    selectPastRunCategory,
    setNewAutomationSchedule,
    updateToggledAutoRunCategories,
    saveAutoRunDetails,
    cancelAutomation,
  } as BudgetAutomationState;
}

export default useBudgetAutomation;
