#!/bin/bash
TALLY_PATH="./"
DEPLOY_PATH="s3://zooniverse-static/tally.zooniverse.org/"
aws s3 sync "${TALLY_PATH}" "${DEPLOY_PATH}" --delete --exclude "*" --include "main.*.js"  --include "index.html"
