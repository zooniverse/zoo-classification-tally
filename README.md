# Classification tally

A counter which shows the number of classifications on a project by a single user.

https://tally.zooniverse.org/

## Modifying the behaviour of the Tally app

You can change the behaviour of the app by passing in parameters via the website URL. In particular you can Only show details for:
  1. A particular project
  0. A particular user
  2. Or modify what default text is shown on the screen

https://tally.zooniverse.org?project_id=[projectid]&user_id=[userid]
https://tally.zooniverse.org?project_id=[projectid]&username=[username]
https://tally.zooniverse.org?project_id=[projectid]&text=[Show me this text]

Note the above and how query params must start with a `?` character and must be separated with an `&` sign, more details can be found https://en.wikipedia.org/wiki/Query_string

### Query parameters for project

- #### project_id

  For example `project_id=4996` (snapshot serengeti)

### Query parameters for user

- #### user_id

  For example `user_id=1234`

- #### username

  For example `username=iam1234`

### Query parameters for text
- #### text to display

  For example `?text=Show me this text`

## Development and deployment

`npm install` installs dependencies

`npm start` builds and runs the site locally. N.B this runs on local.zooniverse.org to prevent a CORS error while trying to access the Zooniverse stats API.

`npm deploy` builds and deploys to https://tally.zooniverse.org/
