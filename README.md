# React TypeScript Starter

This repository is a complete and functional React app, which is built using TypeScript. This will allow me to have a starting point for a vanilla React application that I can start developing with.

In order to get started using this boilerplate, simply clone or fork this repository, and start integrating your API using Express!

---

# Usage

## Forking/Cloning

When using this as a starter project, perform the following steps:

1. Install the dependencies for the project
   `npm install`
   <br/>
2. Run the project
   `npm run start`

This will start up a development server using Webpack to run the site locally on the user's machine.

### Using CI/CD

This project includes files which allow for GitHub Actions to build and deploy
the API to AWS automatically. In order for these files to work correctly, the following steps will need to happen:

1.  In AWS, create an AWS GitHub Actions role which will perform certain actions within AWS on our behalf from the GitHub Actions script.

        - In IAM, create a new "Identity Provider" which connects to the GitHub repo
        - Then, create an IAM Role which uses our Identity Provider as the Trust Relationship
        - Then, for that same role, add the following policy for its permissions: `AdministratorAccess`

    <br>

2.  In the "Settings" tab of this repository in GitHub, under Security->Secrets and Variables->Actions, add the following secret values:

    - _AWS_ACCOUNT_ID_
      - This is the Account ID of the AWS Account that the resources should be provisioned in
    - _AWS_REGION_
      - The region within AWS that these resources should be provisioned in
    - _SITE_URL_
      - The URL for the site that should be created
      - **NOTE:** This site should already have been purchased and a hosted zone created within AWS Route 53
    - _AWS_GHACTIONS_ROLENAME_
      - The name of the role within AWS IAM that has permissions to run AWS scripts on our behalf.
      - **NOTE:** - This was set up in Step 1.
    - _CLOUDFRONT_DISTRIBUTION_ID_
      - The ID of the CloudFront distribution created by the GitHub Actions script
      - **NOTE:** - This will need to be updated a second time, as noted in the next section.

Once these two steps are completed, the `create_aws_site.sh` script will _almost_ run properly and be able to perform all the necessary actions needed to provision the AWS resources needed for our React site to be available.

1. After the first run, the GitHub Actions script will fail on CloudFront invalidation
2. Go to AWS CloudFront, find the Distribution ID, and update the corresponding GitHub secret
3. Lastly, re-run the failed GitHub Actions script to finish syncing and invalidating

Once that distribution ID is set properly as a GitHub secret for the repository, the CI/CD pipeline is complete, and updates to the site will automatically be synced upon pushing a new version of code to the repo.

---

# Tutorial

To learn more about how this repository was created, view my tutorial here:

- [Deploy a React app via AWS S3 & CloudFront](https://nblaisdell.atlassian.net/wiki/spaces/~701210f4b5f4c121e4cd5804ebc078dd6b379/pages/51675137/Deploy+a+React+app+via+AWS+S3+CloudFront)

---

# Features

The rest of this README will discuss the various features that are included in this React app repo. This will include the various libraries that are included in the repo, by default, since they are so commonly used among various websites.

## Webpack & Babel

One of the main purposes for creating this repository is that I not only wanted to automate the deployment of a React app, but more so the fact that I wanted to learn what actually went into creating a React app from scratch, without using CLI tools like `create-react-app` or meta-frameworks like NextJS! (As much as I love NextJS!!)

When going with this method of creating a React app, the first roadblock that you will come across is the fact that we have no way of building our React app into a usable JavaScript file that the browser is able to understand, parse and display. This is where the two technologies come in:

- **Webpack** - This library allows us to take all the different modules, and various other files used and referenced throughout our application, and merge them all into a single JavaScript file, as well as converting it to an older version of ECMAScript, one that is known by most browsers.
- **Babel** - This library enhances Webpack, and does the "transpilation" from one language to another (`.jsx` / `.ts` / `.tsx` to `.js`).

After configuring the `webpack.config.js` and `.babelrc` files, we're able to build our React app into a `dist` folder, providing us with a "minified" version of our code which can be uploaded to whatever server will be hosting our files for public availability. In our case, this will be AWS S3.

- `npm run build`

We're also able to utilize one of webpack's technologies, `webpack-dev-server`, which enables us to run a local server on our machine to locally run the React app. This is great for rapid development, and will mainly be used when creating a new application.

- `npm run start`

## TypeScript

TypeScript is a "superset" of JavaScript and it gives us type-safety in a language that normally doesn't have it. This will allow us to annotate each of our variables, parameters and functions with user-defined (or pre-defined) types and ensure that we are using and passing the appropriate types, and all required values exist on each of the objects within our code.

This can speed up development tremendously, having the confidence that the type system is doing a lot of the work for us.

## TailwindCSS

TailwindCSS is a "utility-first" CSS framework which provides us with a ton of pre-defined classes that we can apply directly to our HTML. While seemingly verbose at first, it is vastly superior to the original way of creating CSS.

The reason that I enjoy it is that I don't have to create separate files for styling, I can see the styles that are applied to each element directly looking at my HTML, and making changes is incredibly smooth and fast when developing, which was a huge roadblock for me when developing websites in the first place. I can honestly say that this one technology is the main reason I've even made it this far in web development.

## React Query / Axios

Retrieving data from external sources can be a bit of a hassle in React, especially due to its asynchronous nature. As a result, we can make use of a very useful library named "React Query", which gives us a simple API for querying data, and mutating data, with no preference as to how the data is retrieved. As a result, we'll additionally be making use of `axios`, which gives us another simple API for working with REST APIs, and these two technologies will work in conjunction to easily get data to use within our React applications.

#### React Query Example

```
// User-Defined type to hold
// return data from API
type Data = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

// UseQuery API
const { data, isLoading, isError } = useQuery({
queryKey: ["data"], // used for caching
// code to run that will get the data needed
queryFn: async () => {
    const url = "https://jsonplaceholder.typicode.com/posts/1";
    const { data } = await axios.get(url);
    return data as Data;
},

console.log(data); // {"userId": 1, "id": 1, "title": "sunt aut facere...", "body": "quia et suscipit\nsuscipit recusandae..."}
});
```

## React Testing Library / Jest

Testing our applications is incredibly important, and so having a testing library included in the template was very important to me.

In this case, we're using a popular testing library simply known as the "React Testing Library". Built on top of `jest`, we can test various elements of our code, as well as mocking the actual actions that a user would take on our website, allowing us to further test our client-side part of our React application.

#### Example Test File (App.test.tsx)

```
import { render, screen } from "@testing-library/react";
import App from "./App";
import React from "react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

describe("App Page Tests", () => {
  it("should contain default welcome message on the screen", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    const myDiv = screen.getByText(
      "Welcome to React App that's built using Webpack and Babel"
    );
    expect(myDiv).toBeInTheDocument();
  });
});


```

## Winston Logging Library

I want to start logging and make it a regular part of my development process, and I also want to follow best practices when it comes to creating logs, so that they are as valuable as possible.

Winston is a great JavaScript library which gives us a great API for defining a logger, and then we can use it throughout the rest of our application.

We're able to define different formats for how the logs should be generated and displayed, and we can define multiple ways for those logs to be sent out, either via the console, to a file, a database, a REST api, and possibly others.

- For this template project, it's currently only writing to the console.
