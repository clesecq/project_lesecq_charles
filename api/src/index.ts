import express, { json, urlencoded, Request, Response } from "express";
import cors from "cors";
import db from "./models/index.js";
import routes from "./routes/index.js";

const app = express();

const corsOptions = {
  origin: "*",
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  headers: 'Content-Type, Authorization',
  exposedHeaders: 'Authorization'
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// simple route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to CNAM application." });
});

// Database sync
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err: Error) => {
    console.log("Failed to sync db: " + err.message);
  });

// Setup routes
routes(app);

// Get port from environment or use default
const PORT = process.env.PORT || 3000;

// set port, listen for requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
