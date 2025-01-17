## Codako Backend

This is a small NodeJS + Typescript + Express backend that powers the Codako website. The backend manages user accounts and allows users to save their worlds -- that's about it!

When you're doing local development, you may be able to skip running this API service and have your local copy of the `frontend` talk to codako.org. To do that, edit `frontend/src/helpers` and change the `API_ROOT` to `https://codako.org`.

To run the backend locally:

0. Edit `API_ROOT` in the front-end and set it to `http://localhost:8080`

1. Run `yarn install`

2. Run Postgres on your computer, ideally using something like https://postgres.app and create an empty database called `codako`.

3. Duplicate the template.env file and rename it .env. Fill in your postgres database connection string. Some postgres installations may use your computer username as the default postgres username, so the template value may not work out of the box.

4. Run `yarn run typeorm schema:sync` (this command will create the tables in the new database)

5. Run `yarn dev`

This will start the backend on port 8080! It doesn't look like much, but if you visit `http://localhost:8080/worlds/explore`, you should see an empty response showing no published worlds. When you run the front-end (in a separate terminal window), you'll need to go through the account creation flow to create a new user in your local API database.
