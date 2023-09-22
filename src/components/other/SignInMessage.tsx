import React from "react";
import Card from "../elements/Card";

function SignInMessage() {
  return (
    <div className="flex items-center justify-center space-x-8 h-full w-full bg-primary text-color-primary font-mplus">
      <div className="flex flex-col justify-center space-y-10 h-full">
        <Card className="flex flex-col space-y-4 items-center py-20">
          <div className="font-bold text-4xl text-center mt-2">Step 1</div>
          <div className="px-6 font-semibold text-xl">
            1. Login to Evercent in the top-right of the page.
          </div>
        </Card>
        <Card className="flex flex-col space-y-8 items-center py-20">
          <div className="font-bold text-4xl text-center mt-2">Step 2</div>
          <div className="px-6 font-semibold text-xl">
            2. Connect Evercent to your YNAB Budget
          </div>
        </Card>
      </div>
      <Card className="flex flex-col space-y-8 items-center py-4 h-[96%] w-[45%]">
        <div className="font-bold text-4xl text-center mt-2">Step 3</div>
        <div className="px-6 font-semibold text-xl">
          3. Start using the Evercent Widgets to enhance your YNAB experience!
        </div>
        <div className="h-full flex flex-col justify-around">
          <div className="px-4">
            <div className="font-cinzel text-2xl text-center">
              Budget Helper
            </div>
            <ul className="list-disc list-inside space-y-4">
              <li>
                Visualize your monthly budget to quickly see how much goes to
                what on a monthly basis
              </li>
              <li>
                Combine this information with the{" "}
                <span className="font-cinzel">Budget Automation</span> tool to
                completely automate your budget!
              </li>
            </ul>
          </div>
          <div className="px-4">
            <div className="font-cinzel text-2xl text-center">
              Budget Automation
            </div>
            <ul className="list-disc list-inside space-y-4">
              <li>
                Automatically budget the amounts set in the{" "}
                <span className="font-cinzel">Budget Helper</span> tool in your
                connected YNAB account on an automated schedule!
                <ul className="list-disc list-inside ml-4">
                  <li>
                    Transactions will still need to be entered manually, but on
                    payday, the process of moving the money from &quot;To Be
                    Assigned&quot; to the budget will be automated.
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <div className="px-4">
            <div className="font-cinzel text-2xl text-center">& More</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SignInMessage;
