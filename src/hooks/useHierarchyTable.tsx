import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CheckboxItem } from "../components/elements/HierarchyTable";
import { log } from "../utils/log";

export type HierarchyTableProps = {
  data: any;
  createListFn: (data: any) => CheckboxItem[];
};

export type HierarchyTableState = {
  listData: CheckboxItem[];
  expandedItems: CheckboxItem[];
  setListData: Dispatch<SetStateAction<CheckboxItem[]>>;
  setExpandedItems: Dispatch<SetStateAction<CheckboxItem[]>>;
};

function useHierarchyTable(
  from: string,
  data: CheckboxItem[]
): HierarchyTableState {
  const [expandedItems, setExpandedItems] = useState<CheckboxItem[]>([]);
  const [listData, setListData] = useState<CheckboxItem[]>(data);

  // useEffect(() => {
  //   setListData((prev) => {
  //     // console.log("expanded items", expandedItems);
  //     let newList = createListFn(data);
  //     for (let i = 0; i < newList.length; i++) {
  //       const currItem = newList[i];
  //       if (currItem) {
  //         const foundExpanded = expandedItems.find((c) => c.id == currItem.id);
  //         if (foundExpanded) {
  //           // if (prev.find((p) => p.id == currItem.id)?.expanded)
  //           currItem.expanded = true;
  //         }
  //       }
  //     }

  //     console.log("newList", newList);
  //     return newList;
  //   });
  // }, [data]);

  return {
    listData,
    expandedItems,
    setListData,
    setExpandedItems,
  };
}

export default useHierarchyTable;
