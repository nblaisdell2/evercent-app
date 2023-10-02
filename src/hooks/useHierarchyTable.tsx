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
  data: any,
  createListFn: (data: any, expandedItems?: CheckboxItem[]) => CheckboxItem[]
): HierarchyTableState {
  const [expandedItems, setExpandedItems] = useState<CheckboxItem[]>([]);
  const [listData, setListData] = useState<CheckboxItem[]>([]);

  useEffect(() => {
    if (listData.length == 0) {
      setListData(createListFn(data, expandedItems));
    }
  }, [data]);

  return {
    listData,
    expandedItems,
    setListData,
    setExpandedItems,
  };
}

export default useHierarchyTable;
