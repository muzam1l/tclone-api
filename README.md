
![Azure build](https://github.com/muzam1l/tclone-api/actions/workflows/master_tclone-api.yml/badge.svg)

## API Server for [tclone](https://github.com/muzam1l/tclone)

Try the app [here](https://tclone.muzam1l.com)

This project is my own take on building Twitter clone and I have tried to keep things simple and concise. With minimal modules needed, it is very lightweight and fast, yet very functional and feature-rich. Three parts of project viz, Front-end, Database and API server are separately hosted. This repo contains the source code for the server API providing REST API for interacting with database and authentication.
## Things used

- `Express` for server.

- `MongoDB` for database and a full text search!

- `Mongoose` as *Mongo* driver and for model and schema validation.

- `Passport` with Local strategy for authentication.

- `Bcryptjs` for password hashing.

- `Cookies/express-session/connect-mongo` for session management and storage

## File structure.

- `app.js` - main express app file.
- `passport.js` auth strategy and serialization.
- `models/`
  - contains `Mongoose` schema's and models for database collections.
- `routes/`
  - `auth.js` - contains authentication related routes, like `/auth/login`, `/auth/logout`, etc.
  - `api.js` - contains all other app routes.
- `controllers/`
  - contains functions to interact with database and return data to routes.
- `serializers/`
  - contains functions to serialize data returned from database to be sent to client.
- `utils/`
  - contains some utility functions.

# Deploying

You will need to set some environment variable, below is the example `.env` file.

```bash
MONGO_URL=<link to atlas address or wherever your mongoDB is deployed, defaults to 'mongodb://localhost/test'>
SESSION_SECRET=<passed to session middleware, defaults to 'my shitty session secret'>

# Push notifications keys. You can generate them with command "./node_modules/.bin/web-push generate-vapid-keys"
PUBLIC_VAPID_KEY=<public vapid key which also goes into React front-end>
PRIVATE_VAPID_KEY=<corresponding private key>
# This must be either a URL or a 'mailto:' address.
# For example: 'https://my-site.com/contact' or 'mailto: contact@my-site.com'
WEB_PUSH_CONTACT="mailto: muzamilsofi@outlook.com"
```

- `npm install` to install dependencies.
- `npm run dev` to start development server with `nodemon`.
- `npm start` to start production server.
