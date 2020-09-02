
## Api server for tclone

Try the app [here](https://tclone.netlify.app)

React frontend repo [here](https://github.com/muzam1l/tclone)

This project is my own take on building Twitter clone, I have tried to keep things simple and concise. With minimal modules needed, it is very lightweight and fast, yet very functional and feature-rich. Three parts of project viz, front-end, database and api server are separately hosted and this repo contains the api code which connects to the front-end app and database.

## Things used

- Express as an api server

- MongoDB as database

- Mongoose as Mongo JavaScript driver, model/schema validation

- Passport/passport-local for authentication

- Bcryptjs for hashed password storage and comparison

- Cookies/express-session/connect-mongo for session management and storage

- And a large part of my otherwise useless brain.

## File structure (UPDATED!)
File structure is now more standard and consice, here is a rundown of project structure 
- `models/`
  - `trend.model.js` - contains mongoose schema's for models and their respective methods/statics
- `routes/`
  - `auth.js` - contains authentication related routes, like `/auth/login`, `/auth/logout`, etc.
  - `api.js` - contains all other routes
- `controllers/`
  - `user.controller.js` contains functions to be used in router, like `getUser` for `/api/user/:username` endpoint
  - ...
- `serializers/`
  - `post.serializer.js` contains functions to serialize Post Object or Array and includes fields particular to authticated user.
  - ...
- `utils/`
  - `helpers.js`  containes some miscellaneous helper utilities like escapeHtml, etc
  - `mddlewares.js` middlewares like ensureLoggedIn
- `dummy-data/` contains json and script for parsing some pre-populated data
- `passport.js` passport related congig and functions
- `app.js` main express app.

##  This is the overview of what's contained in this repo.

### ⚡ Routes ⚡
Routes are divided into two parts `/auth` (*routes/auth.js*) and `/api` (*routes/api.js*). As it is inferred /auth contains authentication related sub routes, so user signup is done via `POST /auth/signup` endpoint and login is done via `POST /auth/login`. There is also `GET /auth/login` which returns `200` if user is logged in (has a session up) and is used by front-end code to check for logged-in session. Other routes fall under `/api` and these include `GET /api/home_timeline` to get post feed of authenticated user, `POST /api/post` to create a new post of user authenticated user, `GET /api/search` for posts related query by the user (not needed to be authenticated) and `GET /api/trends` to get trending hashtags,etc among others.

### ⚡ Database Models ⚡

There is bunch of mongoose models viz `Auth`, `Post`, `Friendship`, `Trend`, `home_timeline`, etc. All the functions which interacts with these models are contained in the same file as their schema (see *models/*). Any Api call or other models do not directly access the collection (represented by Models), instead they call their respective helper functions to get data, for example `/api/home_timeline` calls `getTimeline` in *home_timline.js* to get posts sorted and page wise. There is also some sandboxing to some models like `Auth` and `Friendship`, `User` model do not even store the Reference (_id) of `Auth` model or `Friendship` model, instead each `Auth` model containing user's hashed password, contains the user_id of user and not vice-versa. This accounts for additional security as User object is often populated into post object when sent to user, this method guaranties of no accidental leakage of password Hash or even its reference.

### ⚡ Pre_populating ⚡

Some data (tweets and users) is fed into database at server-start to get a bunch of posts in [tclone](https://tclone.netlify.app/) app (data is updated not overwritten). These are actual recent tweets on Twitter and fetched via twitter api and then populated in database. Tweet Model on this project is exactly compatible with Tweet objects returned by Twitter api and this data is read from *dummy_data/home_timeline.json*, which is original return value of twitter api */statuses/home_timeline*. This file can also be filled with any list of valid tweet objects (*models/post.js*) and that data will be _appended_ to database, all of this behavior is controlled by *dummy_data/pre_populate.js* which is invoked upon successful connection to the mongo database.

### ⚡ Trend Analysis ⚡

Each post added to database is parsed for any #hastags or @user_mentions. These hashtags (along with storing in `Post.entities`) is stored in hashtags collection (Hashtag model) along with number of times it has been posted. From there Trending hashtags are retrieved as simply the ones with highest post volume . Selecting these highest volume hastags is done at a interval of (currently) 30 seconds, therefore trends are upadted realtime to what users are posting.

### ⚡ Search ⚡

Posts can be searched for text they contain; user mentions they contain (@prefix in query) and hashtags they contain (#prefix in query). Text search is done via MongoDB text search of indexes and for user mentions and hashtags, these are simply compared from `post.entities`.

### ⚡ Authentication ⚡

Authentication is done with passport local-strategy with sessions managed server side via cookies which are also httpOnly. Along with an api end point for checking logged in session (GET /auth/login) which returns success if user is logged in, subsequent api requests return `403` to flag *inauthentication* and is also used by front end to destroy session cookie.

## About project
This is my fun little project which I developed during learning web development and is in no way complete or sophisticated. Any suggestions or even contributions are welcome, and I am sure there is lot more for me learn to make it better.
