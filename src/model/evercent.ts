import { AutoRun } from "./autoRun";
import { UserData } from "./userData";
import { Budget } from "./budget";
import { CategoryGroup, ExcludedCategory } from "./category";

export type EvercentData = {
  userData: UserData | undefined;
  budget: Budget | undefined;
  categoryGroups: CategoryGroup[];
  categoryGroupsAll: CategoryGroup[];
  excludedCategories: ExcludedCategory[];
  autoRuns: AutoRun[];
  pastRuns: AutoRun[];
};
