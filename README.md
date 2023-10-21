# Evercent

Evercent is a budgeting-assistance tool/site (built using React) which works in combination with YNAB in order to enhance the YNAB experience, as well as help people visualize and automate their budget!

> To learn more about Evercent:
>
> - <i>Confluence</i> - [Evercent Documentation](https://nblaisdell.atlassian.net/wiki/spaces/E/overview)

# Setup

1. First, clone this repo and install the required dependencies for this web app

```shell
# Clone repo and move into repo directory
git clone https://github.com/nblaisdell2/evercent-app.git && cd evercent-app

# Install required dependencies
npm install
```

<br/>

2. Next, create a `.env` file with the following environment variables:
   - These variables can also be found in the `.env.example` file included in this repo
   - The Auth0 variables are used to connect this application to our existing application on [Auth0](https://auth0.com), which allows us to have login/logout and user capabilties built into our app!
     - <i>Auth0 Tutorial</i> - https://auth0.com/blog/complete-guide-to-react-user-authentication/
     - <i>Confluence Tutorial</i> - [Auth0 & React](https://nblaisdell.atlassian.net/wiki/spaces/~701210f4b5f4c121e4cd5804ebc078dd6b379/pages/53805057/Auth0)
   - The API URL is for connecting to the running Evercent API for this app's backend
     - The live version of the API is hosted at: https://fg20cv9eg4.execute-api.us-east-1.amazonaws.com/dev
     - For more info on the Evercent API, and to run a local version of the API, see: https://github.com/nblaisdell2/evercent-api

```shell
# Variables for Auth0
AUTH0_DOMAIN="{{AUTH0_DOMAIN}}"
AUTH0_CLIENT_ID="{{AUTH0_CLIENT_ID}}"
AUTH0_CLIENT_SECRET="{{AUTH0_CLIENT_SECRET}}"
AUTH0_REDIRECT_URI="{{AUTH0_REDIRECT_URI}}"

# Base URL for our API
BASE_API_URL="{{BASE_API_URL}}"
```

<br/>

3. Finally, run the app using the following command

```shell
# Run the API
npm run dev
```

At this point, you should have the application up-and-running on `http://localhost:3000` !

<br/>

#### Deployment

This repo also includes scripts and a GitHub Action workflow to automatically provision and upload our code into a hosted web app within AWS, as part of the [template](https://github.com/nblaisdell2/react-typescript-starter) used to create this repository. This means an AWS account will be required, and a few environment variables (in the form of GitHub repo secrets) need to be created in the repo in order for the scripts to run correctly.

> For more info on this process:
>
> - <i>GitHub README</i> - https://github.com/nblaisdell2/react-typescript-starter#using-cicd
> - <i>Confluence Tutorial</i> - [Deploy a React app via AWS S3 & CloudFront](https://nblaisdell.atlassian.net/wiki/spaces/~701210f4b5f4c121e4cd5804ebc078dd6b379/pages/51675137/Deploy+a+React+app+via+AWS+S3+CloudFront)

<br/>

# Overview

<i style="font-size:125%">Evercent Home Page - https://evercent.net</i>
<img src="/public/evercent_full.jpg" />

Once the user is logged in, they will first have to connect their account to YNAB to let Evercent know which budget to work with. Once connected, the user will be met with the screen above, where they can enter their user details (in the top banner) and work with the 4 main widgets in the main section, which make up the functionality of Evercent. Each of the 4 widgets show some preliminary information, based on what's currently configured, and each can be clicked on in order to interact further with the data.

## User Details

The first step the user should take is to configure these "User Details" settings in the top-right part of the screen, using the Edit icon in order to make changes. These details need to be configured first before continuing, as the details set here will be used in the 4 main widgets, described below.

The fields that can be updated are:

- **Monthly Income**
  - This is the _rough_ amount that the user makes on a monthly basis
  - This number should be rounded down from the user's best guess
- **Pay Frequency**
  - This is how often the user gets paid
  - `Weekly`, `Bi-weekly` or `Monthly`
- **Next Paydate**
  - This is the exact date that the user will receive their next paycheck
  - This only needs to be set once, and will be automatically updated going forward, using the previous **Pay Frequency** field

## Budget Helper

This widget allows users to visualize exactly how much each category in their budget is contributing to their overall monthly income. Once a user has set up their budget appropriately, this application will pull each of those categories in, and allow the user to set an amount for each of those categories, and the chart in the widget will display how much that category will take up from their monthly income.

By doing so, users are able to see exactly how much they are able to afford, and where they might want to cut back, and since it's directly tied to their actual budget, it's very accurate.

This widget will also take measures to alter the amounts for certain categories, where they aren't paid on a monthly basis (known as Regular Expenses within Evercent), to match exactly how much _would_ be paid per month.

> To learn more about this widget, see: https://nblaisdell.atlassian.net/wiki/spaces/E/pages/2752834/Budget+Helper

## Budget Automation

This widget will start working once the user has some categories set up with some amounts within the "Budget Helper" widget. Once they do, in this widget, they are able to select a time of day which will be used (in conjunction with their paydate, setup earlier in the "User Details" section) to create an automation schedule for their budget. On that time/day, Evercent will take all the categories in the Budget Helper section, determine how much should be added to the user's budget for that category based on their pay frequency, and post that new amount to their budget automatically on payday!

Since the Budget Helper is directly tied to the categories in the user's real budget, and the amount is based on their _rough_ monthly income, theoretically, whatever amounts were configured in the Budget Helper section are _exactly_ what the user would be adding to their budget anyway, so as a result, this widget will automate that process. By doing so, the user will only ever have to enter their transactions (and paycheck transaction) into their budget, and the process of moving money from the "To Be Assigned" section to the separate budget categories will happen automatically.

> To learn more about this widget, see: https://nblaisdell.atlassian.net/wiki/spaces/E/pages/360462/Budget+Automation

## Regular Expenses

This widget is one that allows us to check our progress in regards to reaching 6 months ahead on each of our Regular Expenses. Each category that is marked as a "Regular Expense" within the Budget Helper widget will be found in this widget, where we're able to see how many "months ahead" each of these categories are within our budget.

To determine the "months ahead" for a category, Evercent will take the amount entered for each category by the user in the Budget Helper chart, and then check the user's actual budget to see how many months into the future have actually been fully funded with that amount.

Once the user has reached their target for each category, they can start to allocate their extra funds elsewhere, and relax!

> To learn more about this widget, see: https://nblaisdell.atlassian.net/wiki/spaces/E/pages/164281/Regular+Expenses

## Upcoming Expenses

This widget is a simple one, and just shows us details about any category that was marked as an "Upcoming Expense" within the Budget Helper widget. Each of those categories will have a regular amount, like any other category, to determine how much will be saved per month for this category. But, there will also be an additional amount, which represents the "total amount" to pay for this expense. Therefore, this feature should be used on a category for saving for something, perhaps that will take some time to save for.

This widget will determine, based on the amount saved per month and the total amount for the purchase, how long will it take and on what date will the user be able to make the purchase?

> To learn more about this widget, see: https://nblaisdell.atlassian.net/wiki/spaces/E/pages/360455/Upcoming+Expenses

# Purpose/Philosophy

Once I started using a budgeting tool like YNAB regularly, I found myself repeating the same steps on every paycheck. As a result, and because I'm a software developer, this instantly made me think of how I could automate this process.

On top of that, I found it very important to fund an emergency fund of at least 6 months ahead, so I also wanted to incorporate that into the application, as well as making it as easy as possible for others to do the same.
