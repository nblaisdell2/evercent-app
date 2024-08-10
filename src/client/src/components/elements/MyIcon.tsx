import {
  XMarkIcon,
  CheckIcon,
  MinusIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import {
  MoonIcon,
  SunIcon,
  CheckIcon as CheckIconSolid,
  MinusIcon as MinusIconSolid,
  XMarkIcon as XMarkIconSolid,
  PencilSquareIcon as PencilSquareIconSolid,
  ArrowTopRightOnSquareIcon as ArrowTopRightOnSquareIconSolid,
} from "@heroicons/react/24/solid";
import React from "react";
import { log } from "../../utils/log";

export type IconType =
  | "EditIcon"
  | "GoToIcon"
  | "MinusIcon"
  | "CheckMark"
  | "LightMode"
  | "DarkMode"
  | "CloseIcon";

export function getIcon(
  useSolid: boolean,
  iconType: IconType,
  className?: string,
  onClick?: () => void
) {
  let icon: React.JSX.Element;

  switch (iconType) {
    case "EditIcon":
      icon = useSolid ? (
        <PencilSquareIconSolid className={className || ""} onClick={onClick} />
      ) : (
        <PencilSquareIcon className={className || ""} onClick={onClick} />
      );
      break;
    case "GoToIcon":
      icon = useSolid ? (
        <ArrowTopRightOnSquareIconSolid
          className={className || ""}
          onClick={onClick}
        />
      ) : (
        <ArrowTopRightOnSquareIcon
          className={className || ""}
          onClick={onClick}
        />
      );
      break;
    case "CloseIcon":
      icon = useSolid ? (
        <XMarkIconSolid className={className || ""} onClick={onClick} />
      ) : (
        <XMarkIcon className={className || ""} onClick={onClick} />
      );
      break;
    case "MinusIcon":
      icon = useSolid ? (
        <MinusIconSolid className={className || ""} onClick={onClick} />
      ) : (
        <MinusIcon className={className || ""} onClick={onClick} />
      );
      break;
    case "CheckMark":
      icon = useSolid ? (
        <CheckIconSolid className={className || ""} onClick={onClick} />
      ) : (
        <CheckIcon className={className || ""} onClick={onClick} />
      );
      break;
    case "LightMode":
      icon = <SunIcon className="h-7 w-7 text-orange-400" />;
      break;
    case "DarkMode":
      icon = <MoonIcon className="h-7 w-7 text-yellow-300" />;
      break;
  }

  return icon;
}

function MyIcon({
  iconType,
  className,
  onClick,
}: {
  iconType: IconType;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <>
      <div className="block dark:hidden">
        {getIcon(false, iconType, className, onClick)}
      </div>
      <div className="hidden dark:block">
        {getIcon(true, iconType, className, onClick)}
      </div>
    </>
  );
}

export default MyIcon;
