# Classification tally

A counter which shows the number of classifications on a project by a single user.

https://tally.zooniverse.org/

## Querying for a project and user

Querying for a particular project or user is done via query parameters in the url:

https://tally.zooniverse.org?project_id=[projectid]&user_id=[userid]

### Query parameters for project

- #### project_id

  For example `project_id=4996` (snapshot serengeti)

### Query parameters for user

- #### user_id

  For example `user_id=1234`

- #### username

  For example `username=iam1234`

## Development and deployment

`npm install` installs dependencies

`npm start` builds and runs the site locally. N.B this runs on local.zooniverse.org to prevent a CORS error while trying to access the Zooniverse stats API.

`npm deploy` builds and deploys to https://tally.zooniverse.org/
