import express, { Request, Response } from "express";
import fileupload from "express-fileupload";
import cors from "cors";
import helmet from "helmet";
import { routeBuilder } from "./routes";
import * as config from './config';
import { doHealthCheck } from "./utils/healthCheck";
import { runMigrations } from "./data";
import { startScheduler } from "./jobs/schedule";

// get the database to the latest state
runMigrations();

const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(fileupload());
app.use(helmet());

// very basic CORS setup
app.use(cors({
  origin: config.FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true
}));

// use the node-schedule module and load jobs into it
startScheduler();

app.get("/api/healthCheck", (req: Request, res: Response) => {
  doHealthCheck(res);
});

routeBuilder(app);

app.listen(config.API_PORT, () => {
  console.log(`API listenting on port ${config.API_PORT}`);
});
