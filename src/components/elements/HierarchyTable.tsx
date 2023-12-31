import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import MyCheckbox from "./MyCheckbox";
import { find } from "../../utils/util";
import { log } from "../../utils/log";

export type CheckboxItem = {
  parentId: string;
  id: string;
  name: string;
  data?: any;
  selected?: boolean;
  expanded?: boolean;
  locked?: boolean;
};

export type HierarchyTableProps = {
  tableData: {
    listData: CheckboxItem[];
    setListData: React.Dispatch<React.SetStateAction<CheckboxItem[]>>;
    setExpandedItems: React.Dispatch<React.SetStateAction<CheckboxItem[]>>;
  };
  getRowContent: (item: CheckboxItem, indent: number) => JSX.Element;
  indentPixels: string;
  isCollapsible?: boolean;
  showCheckboxes?: boolean;
  disableOnClick?: boolean;
  onDataChanged?: (newItems: CheckboxItem[]) => void;
};

function HierarchyTable({
  tableData,
  getRowContent,
  indentPixels,
  isCollapsible,
  showCheckboxes,
  disableOnClick,
  onDataChanged,
}: HierarchyTableProps) {
  const [hoveredItems, setHoveredItems] = useState<string[]>([]);
  const { listData, setListData, setExpandedItems } = tableData;

  const getChildIDs = (
    item: CheckboxItem,
    includeSelf: boolean,
    currLevel: number = 0,
    maxLevel: number = -1
  ) => {
    let ids: string[] = [];
    if (!listData) return ids;

    for (let i = 0; i < listData.length; i++) {
      const currItem = listData[i];
      if (currItem) {
        if (currItem.parentId == item?.id) {
          if (maxLevel == -1 || currLevel < maxLevel) {
            ids = [
              ...ids,
              currItem.id,
              ...getChildIDs(currItem, includeSelf, ++currLevel, maxLevel),
            ];
            --currLevel;
          } else {
            ids = [...ids, currItem.id];
          }
        }
      }
    }

    if (includeSelf) return [...new Set([item.id, ...ids])];
    return [...new Set([...ids])];
  };

  const toggleSelected = (item: CheckboxItem, on: boolean, idx: number) => {
    let newItems = [...listData];
    for (let i = 0; i < newItems.length; i++) {
      const currItem = newItems[i];
      if (currItem) {
        if (
          currItem.parentId == item.id ||
          (idx == 0 && currItem.id == item.id)
        ) {
          currItem.selected = on;
          newItems = toggleSelected(currItem, on, ++idx);
        }
      }
    }

    return newItems;
  };

  const parentsAreExpanded = (
    itemList: CheckboxItem[],
    item: CheckboxItem
  ): boolean => {
    const itemParent = itemList.find((itm) => itm.id == item.parentId);
    if (itemParent && itemParent.expanded) {
      let isExpanded = itemParent.expanded;
      if (!isExpanded) {
        return false;
      }
      if (itemParent.parentId == "") {
        return true;
      }
      return parentsAreExpanded(itemList, itemParent);
    }
    return false;
  };

  const createInputRow = (
    item: CheckboxItem,
    indent: number,
    isGroup: boolean
  ) => {
    if (indent > 0 && isCollapsible && !parentsAreExpanded(listData, item)) {
      return <></>;
    }

    const isDet =
      isGroup &&
      listData
        .filter((itm) => {
          return (
            itm.parentId == item.id || getChildIDs(item, true).includes(itm.id)
          );
        })
        .some((itm) => {
          return itm.selected;
        });
    const isAll =
      isGroup &&
      listData
        .filter((itm) => {
          return itm.parentId == item.id;
        })
        .every((itm) => {
          return itm.selected;
        });

    const parentIsHovered = hoveredItems.includes(item.id) && !item.locked;

    const isLeaf = getChildIDs(item, false).length == 0;

    const LEFT_MARGIN_PIXELS =
      parseInt(indentPixels.replace("px", "")) * indent;
    const indentStyle = {
      paddingLeft:
        (
          LEFT_MARGIN_PIXELS +
          // extra padding to account for not having an icon to the left
          (isLeaf && isCollapsible ? 15 : 2)
        ).toString() + "px",
    };

    const rowContent = getRowContent(item, indent);

    // console.log("rowContent", rowContent);

    const rowItems = rowContent?.props?.children
      ? rowContent.props.children.length > 1
        ? [...rowContent.props.children]
        : [rowContent.props.children]
      : [];

    // console.log("onClick?", rowContent?.props?.onClick);
    const newRowItems = (
      <>
        <div style={indentStyle} className={rowItems[0]?.props?.className}>
          {!isLeaf &&
            isCollapsible &&
            (item.expanded ? (
              <ChevronDownIcon className="h-4 sm:h-6 w-4 sm:w-6" />
            ) : (
              <ChevronRightIcon className="h-4 sm:h-6 w-4 sm:w-6" />
            ))}
          {showCheckboxes && (
            <MyCheckbox
              selected={item.selected || false}
              parentIsHovered={parentIsHovered}
              isDet={isDet}
              isAll={isAll}
              isLocked={item.locked || false}
            />
          )}
          {rowItems[0]?.props?.children}
        </div>
        {rowItems.filter((itm, idx) => idx != 0 && itm)}
      </>
    );

    return (
      <div
        className={`flex items-center ${
          rowContent?.props?.children && rowContent.props.className
        }`}
        onClick={() => {
          if (disableOnClick || item.locked) return;

          if (showCheckboxes) {
            let newItems = [...listData];
            let toggle = !item.selected;

            // toggle ALL children AND parent if parent is toggled
            newItems
              .filter((itm) => {
                return (
                  itm.id == item.id || getChildIDs(item, false).includes(itm.id)
                );
              })
              .map((itm) => {
                itm.selected = toggle;
              });

            // toggle parent if ALL children are selected
            newItems
              .filter((itm) => {
                return itm.id == item.parentId;
              })
              .map((itm) => {
                itm.selected = toggle;
              });

            setListData(newItems);
            if (onDataChanged) onDataChanged(newItems);
          }

          if (isCollapsible && !isLeaf) {
            setExpandedItems((items) => {
              if (items.find((itm) => itm.id == item.id)) {
                return items.filter((itm) => itm.id !== item.id);
              } else {
                return [...items, item];
              }
            });

            let newItems = [...listData];

            let thisItem = find(newItems, (itm) => itm.id == item.id);
            if (thisItem) thisItem.expanded = !item.expanded;

            setListData(newItems);
            if (onDataChanged) onDataChanged(newItems);
          }

          if (rowContent?.props?.onClick) rowContent?.props?.onClick();
        }}
        onMouseEnter={() => {
          setHoveredItems(getChildIDs(item, true));
        }}
        onMouseLeave={() => {
          setHoveredItems([]);
        }}
      >
        {rowContent.type.toString() != "Symbol(react.fragment)" && (
          <>{newRowItems}</>
        )}
      </div>
    );
  };

  const createItem = (item: CheckboxItem, indent: number) => {
    return (
      <ul key={item.id}>
        <li>{createInputRow(item, indent, false)}</li>
      </ul>
    );
  };

  const createGroup = (item: CheckboxItem, indent: number) => {
    const subItems = listData.filter((sItem) => sItem.parentId == item.id);
    // log("subItems", subItems);

    return (
      <ul key={item.id}>
        <li>
          {createInputRow(item, indent, true)}

          {subItems && (
            <>
              {subItems.map((subItem) => {
                indent += 1;

                let newItem: JSX.Element;
                let subSubItems = listData.filter(
                  (sItem) => sItem.parentId == subItem.id
                );

                if (subSubItems.length > 0) {
                  newItem = createGroup(subItem, indent);
                } else {
                  newItem = createItem(subItem, indent);
                }

                indent -= 1;
                return newItem;
              })}
            </>
          )}
        </li>
      </ul>
    );
  };

  const startItems = listData.filter((item) => item.parentId == "");
  // log("startItems", startItems);
  return (
    <>
      {startItems?.map((item) => {
        return createGroup(item, 0);
      })}
    </>
  );
}

export default HierarchyTable;
