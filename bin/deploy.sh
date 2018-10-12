#!/bin/bash
TALLY_PATH="/Users/costello/my_git_repos/zoo-classification-tally"
DEPLOY_PATH="s3://zooniverse-static/tally.zooniverse.org/"
aws s3 sync "${TALLY_PATH}" "${DEPLOY_PATH}" --exclude="bin/*" --exclude=".git/*" --exclude=".git*" --exclude="README.md" --exclude="node_modules/*"
