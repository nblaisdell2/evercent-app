shouldFail=0

if [[ $1 == "none" ]]
then
  echo "{AWS_ACCOUNT_ID} needs to be added to the Secrets in the GitHub repo"
  shouldFail=1
fi

if [[ $2 == "none" ]]
then
  echo "{AWS_REGION} needs to be added to the Secrets in the GitHub repo"
  shouldFail=1
fi

if [[ $3 == "none" ]]
then
  echo "{AWS_CERTIFICATE_ARN} needs to be added to the Secrets in the GitHub repo"
  shouldFail=1
fi

if [[ $4 == "none" ]]
then
  echo "{SITE_URL} needs to be added to the Secrets in the GitHub repo"
  shouldFail=1
fi

if [[ $5 == "none" ]]
then
  echo "{SUBDOMAIN} needs to be added to the Secrets in the GitHub repo"
  shouldFail=1
fi

if [[ $6 == "none" ]]
then
  echo "{CLOUDFRONT_DISTRIBUTION_ID} needs to be added to the Secrets in the GitHub repo"
  shouldFail=1
fi

if [[ $7 == "none" ]]
then
  echo "{AWS_GHACTIONS_ROLENAME} needs to be added to the Secrets in the GitHub repo"
  shouldFail=1
fi

if [[ $shouldFail -eq 1 ]]
then
  echo "Stopping build..."
  exit 1
else
  echo "All needed values found. Continuing build..."
fi