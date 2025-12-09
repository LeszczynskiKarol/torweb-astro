#!/bin/bash
S3_BUCKET="www.torweb.pl"
CLOUDFRONT_ID="E2X74RFF4GP6PI"

cd /d/torweb-astro
npm run build
aws s3 sync dist/ s3://${S3_BUCKET} --delete
aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/*"
echo "✅ Deployed to https://www.torweb.pl"