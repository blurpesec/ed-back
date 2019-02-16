import * as express from 'express';
import * as helmet from 'helmet';
import * as db from './components/db';
import router from './components/router';
import * as config from '../config'
import * as Debug from 'debug';

const debug = Debug('app');
const app = express();
let server;
export const serve = async (): Promise<void> => {
  /* Initialize the database */
  try {
    await db.initializeDB();
  } catch (e) {
    debug(e);
  }
  
  /* Allow both JSON and URL encoded bodies */
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  
  /* Set security headers */
  app.use(helmet());
  app.use(helmet.referrerPolicy());

  /* Serve all other routes */
  app.use(router);

  /* Serve all other pages as 404 */
  app.get('*', (req, res) => res.status(404));

  /* Listen to port (defined in config) */
  server = app.listen(config.port, () => debug('Content served on http://localhost:%s', config.port));
  //await tests.default.testDB();
}

export const shutDown = async (): Promise<void> => {
  
  await db.closeDB();
  server.close(() => {
    debug('Closed out remaining connections');
    process.exit(0);
  });
  setTimeout(() => {
    debug('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 3000);
}

serve();
/* End gracefully */
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
process.on('SIGUSR2', shutDown)