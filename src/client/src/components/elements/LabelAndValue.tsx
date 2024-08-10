import React from "react";
import Label from "./Label";
import TextLoader from "../other/TextLoader";

type Props = {
  label: any;
  value: any;
  isLoading?: boolean;
  classNameLabel?: string;
  classNameValue?: string;
  classNameValueColor?: string;
};

function LabelAndValue({
  label,
  value,
  isLoading,
  classNameLabel,
  classNameValue,
  classNameValueColor,
}: Props) {
  return (
    <div className="flex flex-col items-center">
      <Label
        label={label}
        className={`whitespace-pre-wrap text-center mb-1 text-sm sm:text-lg ${
          classNameLabel || ""
        }`}
      />
      <div
        className={`${classNameValue || ""} font-bold -mt-2 ${
          classNameValueColor || ""
        }`}
      >
        {isLoading !== undefined && isLoading ? (
          <TextLoader />
        ) : (
          <div>{value}</div>
        )}
      </div>
    </div>
  );
}

export default LabelAndValue;
