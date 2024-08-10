import React from "react";
import Switch from "react-switch";

type Props = {
  checked: boolean;
  onToggle: (newChecked: boolean) => void;
  checkedColor?: string;
  uncheckedColor?: string;
  uncheckedIcon?: JSX.Element;
  checkedIcon?: JSX.Element;
  className?: string;
};

function MyToggle({
  checked,
  onToggle,
  uncheckedIcon,
  checkedIcon,
  checkedColor,
  uncheckedColor,
  className,
}: Props) {
  return (
    <>
      <div className="hidden dark:flex">
        <Switch
          checked={checked}
          onChange={(newChecked) => onToggle(newChecked)}
          uncheckedIcon={uncheckedIcon || <div></div>}
          checkedIcon={checkedIcon || <div></div>}
          onColor={checkedColor || "#6B21A8"}
          offColor={"#888888"}
          className={className || ""}
        />
      </div>
      <div className="flex dark:hidden">
        <Switch
          checked={checked}
          onChange={(newChecked) => onToggle(newChecked)}
          uncheckedIcon={uncheckedIcon || <div></div>}
          checkedIcon={checkedIcon || <div></div>}
          onColor={"#1E3A8A"}
          offColor={uncheckedColor || "#888888"}
          className={className || ""}
        />
      </div>
    </>
  );
}

export default MyToggle;
