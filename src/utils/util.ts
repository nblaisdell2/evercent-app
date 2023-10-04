import { v4 } from "uuid";
export const generateUUID = v4;

export const roundNumber = (num: number, decimals: number = 0) => {
  const mul = Math.pow(10, decimals);
  return Math.round(Number(num) * mul) / mul;
};

export const sum = <T>(list: T[], prop: keyof T, start: number = 0): number => {
  return list.reduce((prev, curr) => prev + (curr[prop] as number), start);
};

export const find = <T>(
  list: T[],
  predicate: (value: T, index: number, obj: T[]) => unknown,
  thisArg?: any
): T => {
  return list.filter(predicate)[0];
};

export const getDistinctValues = <T, V extends keyof T>(
  values: T[],
  key: V
): T[V][] => {
  let distinctValues: T[V][] = [];
  for (let i = 0; i < values.length; i++) {
    const val = values[i][key];
    if (!distinctValues.includes(val)) {
      distinctValues.push(val);
    }
  }
  return distinctValues;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getMoneyString(amount: number | string, digits: number = 0) {
  if (typeof amount === "string") {
    amount = Number(amount);
  }

  // if (amount % 1 > 0) {
  //   return "$" + amount.toFixed(digits);
  // }
  return "$" + amount.toFixed(digits);
}

export function getPercentString(num: number, digits: number = 0) {
  if (isNaN(num)) num = 0;
  return (num * 100).toFixed(digits) + "%";
}

export function formatTimeAMPM(dt: Date) {
  const numHours = dt.getHours();
  const isPM = numHours > 12;
  const hours = isPM ? numHours - 12 : numHours;
  return (
    hours.toString() +
    ":" +
    dt.getMinutes().toString().padStart(2, "0") +
    (isPM ? "PM" : "AM")
  );
}
