#!/bin/bash

awsAccountID=$1
awsRegion=$2
awsSiteName=$3
awsSubDomain=$4
awsCertificateArn=$5

# TODO: Add better logging to script

if [[ $awsSubDomain == "N/A" ]]
then
  awsSubDomain=""
else
  awsSubDomain=$awsSubDomain"."
fi

echo ===================================
echo CHECKING FOR EXISTING BUCKET
echo ===================================
if aws s3api head-bucket --bucket "$awsSubDomain$awsSiteName" 2>/dev/null; then
  echo "AWS Infrastructure already created..."
else
  echo ===================================
  echo CREATING S3 BUCKET
  echo ===================================
  aws s3api create-bucket --bucket $awsSubDomain$awsSiteName >/dev/null
  aws s3 sync ./dist s3://$awsSubDomain$awsSiteName --delete



  echo ===================================
  echo CREATING CLOUDFRONT DISTRIBUTION
  echo ===================================
  originAccessControlId=$(aws cloudfront create-origin-access-control --origin-access-control-config "{ \"Name\": \"$awsSubDomain$awsSiteName.s3.$awsRegion.amazonaws.com\", \"Description\": \"origin-access-control-setting-description\", \"SigningProtocol\": \"sigv4\", \"SigningBehavior\": \"no-override\", \"OriginAccessControlOriginType\": \"s3\" }" | jq -r .OriginAccessControl.Id)
  # aws acm list-certificates > aws.json
  # certificateArn=$(jq -r '.CertificateSummaryList[] | select(.DomainName == "'$awsSiteName'").CertificateArn' aws.json)
  aws cloudfront create-distribution --distribution-config "{ \"CallerReference\": \"$(uuidgen)\", \"Aliases\": { \"Quantity\": 1, \"Items\": [\"$awsSubDomain$awsSiteName\"] }, \"DefaultRootObject\": \"/index.html\", \"Origins\": { \"Quantity\": 1, \"Items\": [ { \"Id\": \"$awsSubDomain$awsSiteName.s3.$awsRegion.amazonaws.com\", \"DomainName\": \"$awsSubDomain$awsSiteName.s3.$awsRegion.amazonaws.com\", \"OriginPath\": \"\", \"CustomHeaders\": { \"Quantity\": 0 }, \"S3OriginConfig\": { \"OriginAccessIdentity\": \"\" }, \"ConnectionAttempts\": 3, \"ConnectionTimeout\": 10, \"OriginShield\": { \"Enabled\": false }, \"OriginAccessControlId\": \"$originAccessControlId\" } ] }, \"OriginGroups\": { \"Quantity\": 0 }, \"DefaultCacheBehavior\": { \"TargetOriginId\": \"$awsSubDomain$awsSiteName.s3.$awsRegion.amazonaws.com\", \"TrustedSigners\": { \"Enabled\": false, \"Quantity\": 0 }, \"TrustedKeyGroups\": { \"Enabled\": false, \"Quantity\": 0 }, \"ViewerProtocolPolicy\": \"redirect-to-https\", \"AllowedMethods\": { \"Quantity\": 2, \"Items\": [\"HEAD\", \"GET\"], \"CachedMethods\": { \"Quantity\": 2, \"Items\": [\"HEAD\", \"GET\"] } }, \"SmoothStreaming\": false, \"Compress\": true, \"LambdaFunctionAssociations\": { \"Quantity\": 0 }, \"FunctionAssociations\": { \"Quantity\": 0 }, \"FieldLevelEncryptionId\": \"\", \"CachePolicyId\": \"658327ea-f89d-4fab-a63d-7e88639e58f6\" }, \"CacheBehaviors\": { \"Quantity\": 0 }, \"CustomErrorResponses\": { \"Quantity\": 1, \"Items\": [ { \"ErrorCode\": 403, \"ResponsePagePath\": \"/index.html\", \"ResponseCode\": \"200\", \"ErrorCachingMinTTL\": 10 } ] }, \"Comment\": \"\", \"Logging\": { \"Enabled\": false, \"IncludeCookies\": false, \"Bucket\": \"\", \"Prefix\": \"\" }, \"PriceClass\": \"PriceClass_All\", \"Enabled\": true, \"ViewerCertificate\": { \"CloudFrontDefaultCertificate\": false, \"ACMCertificateArn\": \"$awsCertificateArn\", \"SSLSupportMethod\": \"sni-only\", \"MinimumProtocolVersion\": \"TLSv1.2_2021\", \"Certificate\": \"$awsCertificateArn\", \"CertificateSource\": \"acm\" }, \"Restrictions\": { \"GeoRestriction\": { \"RestrictionType\": \"none\", \"Quantity\": 0 } }, \"WebACLId\": \"\", \"HttpVersion\": \"http2\", \"IsIPV6Enabled\": true, \"ContinuousDeploymentPolicyId\": \"\", \"Staging\": false }" > aws.json
  cloudfrontDomain=$(jq -r '.Distribution.DomainName' aws.json)
  cloudfrontArn=$(jq -r '.Distribution.ARN' aws.json)



  echo ===================================
  echo UPDATING S3 BUCKET POLICY FOR CLOUDFRONT ACCESS ONLY
  echo ===================================
  aws s3api put-bucket-policy --bucket $awsSubDomain$awsSiteName --policy "{ \"Version\": \"2008-10-17\", \"Id\": \"PolicyForCloudFrontPrivateContent\", \"Statement\": [ { \"Sid\": \"AllowCloudFrontServicePrincipal\", \"Effect\": \"Allow\", \"Principal\": { \"Service\": \"cloudfront.amazonaws.com\" }, \"Action\": \"s3:GetObject\", \"Resource\": \"arn:aws:s3:::$awsSubDomain$awsSiteName/*\", \"Condition\": { \"StringEquals\": { \"AWS:SourceArn\": \"$cloudfrontArn\" } } } ] }"



  echo ===================================
  echo UPDATING ROUTE53 DNS RECORDS
  echo ===================================
  siteHostedZone=$(aws route53 list-hosted-zones-by-name --dns-name $awsSiteName | jq -r .HostedZones[0].Id)
  aws route53 change-resource-record-sets --hosted-zone-id $siteHostedZone --change-batch "{ \"Changes\": [ { \"Action\": \"CREATE\", \"ResourceRecordSet\": { \"Name\": \"$awsSubDomain$awsSiteName.\", \"Type\": \"A\", \"AliasTarget\": { \"HostedZoneId\": \"Z2FDTNDATAQYW2\", \"DNSName\": \"$cloudfrontDomain.\", \"EvaluateTargetHealth\": false } } } ] }" >/dev/null
  
  rm aws.json
fi