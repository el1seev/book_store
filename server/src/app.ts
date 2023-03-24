import express, { Application, NextFunction, Response, Request } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routers from './routes/index';
import Database from './config/database';
import { ErrorHandler } from './middleware/error_handler';

require('dotenv').config();
const { PORT } = process.env;

export default class Server {
  private app: Application;
  constructor() {
    this.app = express();

    this.config();
    this.routes();
    this.connectToDB();
    this.errorHandler();
  }

  private config(): void {
    this.app.use(cors({ credentials: true }));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  private routes(): void {
    this.app.use('/', routers);
  }

  private errorHandler(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      ErrorHandler.handleError(err, res, req, next);
    });
  }

  private connectToDB() {
    Database.connect();
  }

  public start(): void {
    const port = PORT || 8080;
    this.app.listen(port, () => {
      console.log(`Server listening on post ${port}`);
    });
  }
}
