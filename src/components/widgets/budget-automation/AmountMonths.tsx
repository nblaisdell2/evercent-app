import React, { useEffect } from "react";
import { format, parse, parseISO, startOfDay } from "date-fns";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";
import {
  AutoRun,
  AutoRunCategory,
  AutoRunCategoryGroup,
  AutoRunCategoryMonth,
  getAutoRunCategoryGroupTotal,
  getAutoRunCategoryTotal,
  getAutoRunTotal,
} from "../../../model/autoRun";
import HierarchyTable, { CheckboxItem } from "../../elements/HierarchyTable";
import { generateUUID, getMoneyString } from "../../../utils/util";
import LabelAndValue from "../../elements/LabelAndValue";
import Card from "../../elements/Card";
import useHierarchyTable from "../../../hooks/useHierarchyTable";
import { BudgetAutomationState } from "../../../hooks/useBudgetAutomation";
import { log } from "console";

function AmountMonths({ baProps }: { baProps: BudgetAutomationState }) {
  const createList = (data: any) => {
    const run: AutoRun = data;
    const list: CheckboxItem[] = [];

    if (!run) return list;

    const isLocked = !baProps.showUpcoming ? false : run.isLocked;

    for (let i = 0; i < run.categoryGroups.length; i++) {
      const grp = run.categoryGroups[i];

      if (grp.categories.length > 0) {
        list.push({
          parentId: "",
          id: grp.groupID,
          name: grp.groupName,
          data: grp,
          selected: grp.categories.reduce((prev, curr) => {
            return (
              prev ||
              curr.postingMonths.reduce((prev2, curr2) => {
                return prev2 || curr2.included;
              }, false)
            );
          }, false),
          expanded: true,
          locked: isLocked,
        });

        for (let j = 0; j < grp.categories.length; j++) {
          const cat = grp.categories[j];
          if (!cat.included) continue;

          list.push({
            parentId: grp.groupID,
            id: cat.categoryGUID,
            name: cat.categoryName,
            data: cat,
            selected: cat.postingMonths.reduce((prev, curr) => {
              return prev || curr.included;
            }, false),
            expanded: true,
            locked: isLocked,
          });

          for (let k = 0; k < cat.postingMonths.length; k++) {
            const month = cat.postingMonths[k];

            list.push({
              parentId: cat.categoryGUID,
              id: generateUUID(),
              data: month,
              name: month.postingMonth,
              selected: month.included,
              locked: isLocked,
            });
          }
        }
      }
    }

    log("list", list);
    return list;
  };

  const getRowContent = (item: CheckboxItem, indent: number) => {
    switch (indent) {
      case 0: {
        if (!run) return <></>;

        if (!item.data) return <></>;
        const grp = item.data as AutoRunCategoryGroup;

        return (
          <div className="flex flex-grow justify-between font-mplus font-extrabold py-[1px] hover:cursor-pointer rounded-lg">
            <div className="flex items-center">
              <div>{item.name}</div>
            </div>
            <div className="pr-1">
              {getMoneyString(getAutoRunCategoryGroupTotal(grp))}
            </div>
          </div>
        );
      }
      case 1: {
        if (!run) return <></>;

        if (!item.data) return <></>;
        const cat = item.data as AutoRunCategory;

        return (
          <div
            onClick={() => baProps.selectPastRunCategory(item)}
            className={`flex flex-grow justify-between font-mplus py-[1px] ${
              !baProps.showUpcoming &&
              item.id.toLowerCase() !=
                baProps.selectedPastRunCategory?.categoryGUID.toLowerCase() &&
              "color-accent-hover"
            } hover:cursor-pointer rounded-lg ${
              item.id.toLowerCase() ==
                baProps.selectedPastRunCategory?.categoryGUID.toLowerCase() &&
              "color-accent text-white font-bold"
            }`}
          >
            <div className="flex items-center">
              <div>{item.name}</div>
            </div>
            <div className="pr-1">
              {getMoneyString(getAutoRunCategoryTotal(cat), 2)}
            </div>
          </div>
        );
      }
      case 2: {
        // REFACTOR!
        // This is pretty bad, but it works!
        if (!run) return <></>;

        if (!item.data) return <></>;
        const month = item.data as AutoRunCategoryMonth;

        return (
          <div className="flex flex-grow justify-between font-mplus text-gray-400 text-sm py-[1px] hover:cursor-pointer rounded-lg">
            <div className="flex items-center">
              <div>
                {month?.postingMonth &&
                  format(
                    parseISO(month.postingMonth.substring(0, 10)),
                    "MMM yyyy"
                  ).toUpperCase()}
              </div>
            </div>
            <div className="pr-1">
              {month &&
                getMoneyString(
                  month.amountToPost || month.amountPosted || 0,
                  2
                )}
            </div>
          </div>
        );
      }
      default:
        return <div></div>;
    }
  };

  let run = baProps.showUpcoming
    ? (baProps.nextAutoRun as AutoRun)
    : baProps.selectedPastRun;

  const hierarchyTableProps = useHierarchyTable(run, createList);

  useEffect(() => {
    hierarchyTableProps.setListData(createList(run));
  }, [baProps.showUpcoming]);

  log("run", { run, list: hierarchyTableProps.listData });
  return (
    <div className="flex flex-col flex-grow h-full space-y-2">
      <div className="text-center font-mplus text-2xl sm:text-3xl font-extrabold">
        Amounts Posted to Budget
      </div>
      <div className="flex justify-evenly">
        <LabelAndValue
          label={"Run Time"}
          value={format(
            parseISO(run?.runTime || new Date().toISOString()),
            "MM/dd/yyyy @ h:mma"
          )}
          classNameValue={"font-mplus text-base sm:text-2xl"}
        />
        <LabelAndValue
          label={"Total"}
          value={getMoneyString(run ? getAutoRunTotal(run) : 0)}
          classNameValue={"font-mplus text-base sm:text-2xl text-green-600"}
        />
        {baProps.showUpcoming && (
          <LabelAndValue
            label={"Locked?"}
            value={run?.isLocked ? "Yes" : "No"}
            classNameValue={"font-mplus text-base sm:text-2xl"}
          />
        )}
      </div>
      <Card className="flex-grow h-0 p-1 overflow-y-scroll no-scrollbar">
        <HierarchyTable
          tableData={hierarchyTableProps}
          getRowContent={getRowContent}
          indentPixels={"20px"}
          showCheckboxes={baProps.showUpcoming}
          isCollapsible={false}
          onDataChanged={baProps.updateToggledAutoRunCategories}
        />
      </Card>
    </div>
  );
}

export default AmountMonths;
