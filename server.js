
const dotenv = require("dotenv");
dotenv.config();



const express = require("express"),
      app = express();

app.use( express.static("public"));
app.use( express.json() )

const session = require("express-session");
const passport = require("passport");

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}))


const GitHubStrategy = require("passport-github2").Strategy;

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://a3-ethanshanbaum-production.up.railway.app/auth/github/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      let user = await collectionUsers.findOne({ githubId: profile.id });

      if (!user) {
        user = {
          githubId: profile.id,
          username: profile.username,
          displayName: profile.displayName || profile.username
        };
        const result = await collectionUsers.insertOne(user);
        user._id = result.insertedId;
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await collectionUsers.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(passport.initialize());
app.use(passport.session());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@webwarecluster.prp7a7d.mongodb.net/?retryWrites=true&w=majority&appName=WebWareCluster`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
}); 

const ObjectId = require('mongodb').ObjectId;

let collection = null
let collectionUsers = null

async function run() {
  try {
    // Connect the client
    await client.connect();

    // Get collection
    collection = client.db("webwareDatabase").collection("webwareCollection");
    collectionUsers = client.db("webwareDatabase").collection("webwareUsers");

    // Test connection
    await client.db("webwareDatabase").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }
}
/*
let appdata = [
  {"id": 0, "title": "SoftEng HW Due", "description": "Need to create reactive form and push to GitHub", "date": "2025-09-08", "urgency": "Overdue"},
  {"id": 1, "title": "Mexican Day", "description": "Gonna make quesadillas and tacos for all my friends", "date": "2025-10-01", "urgency": "Low" },
  {"id": 2, "title": "Reading for English", "description": "Read Chapters 1-3 of Brave New World", "date": "2025-09-14", "urgency": "High"} 
]
*/

const calcUrgency = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diff = (targetDate - today) / (1000*60*60*24) // number of milliseconds in a day
  if (diff < 0) return "Overdue";
  if (diff === 0) return "DO IT NOW";
  if (diff < 5) return "High";
  if (diff < 11) return "Medium";
  return "Low";
}

app.post( '/submit', ensureAuthenticated, async (req, res) => {
  let parsedData = req.body
  parsedData.urgency = calcUrgency(parsedData.date)
  parsedData.userId = req.user._id
  const pushedData = await collection.insertOne(parsedData);
  res.writeHead( 200, { 'Content-Type': 'application/json' })
  res.end( )
})

app.get( '/data', ensureAuthenticated, async (req, res) => {
  const items = await collection.find({ userId: req.user._id }).toArray();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end( JSON.stringify(items));
})


app.delete( '/data', ensureAuthenticated, async (req, res) => {
    const result = await collection.deleteOne({ _id: new ObjectId(req.body._id), userId: req.user._id });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end();
});

app.put( '/update', ensureAuthenticated, async (req, res) => {
  let body = req.body
  const result = await collection.updateOne(
    {_id: new ObjectId(body._id), userId: req.user._id},
    {$set: {
      title: body.title,
      description: body.description,
      date: body.date,
      urgency: calcUrgency(body.date)
    }}
  )
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end();
})



run().catch(console.dir);
app.listen( process.env.PORT || 3000)	

process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});


app.get("/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get("/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login.html" }),
  (req, res) => {
    res.redirect("/"); 
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login.html");
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login.html");
}

app.get("/", ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.redirect("/login.html");
  });
});