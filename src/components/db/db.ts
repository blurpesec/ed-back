import * as sqlite3 from 'sqlite3';
import * as Debug from 'debug';

const debug = Debug('db');

const db = new sqlite3.Database('./cache.db', err => {
  if(err) return(err);
  debug('Created a new DB and connected to it.');
});

export const initializeDB = (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        debug('Beginning db initialization');
        try {
            await this.run(
                'CREATE TABLE IF NOT EXISTS entries(id TEXT , name TEXT , address TEXT , username TEXT , description TEXT, PRIMARY KEY(id))'
            );
            await this.run(
                'CREATE TABLE IF NOT EXISTS backup(id TEXT , phrase TEXT , PRIMARY KEY(id))'
            );
            resolve();
        } catch (e) {
            reject();
        }
    });
};

export const closeDB = async (): Promise<void> => {
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      debug('Closed the database connection.');
    });
  }
  
  export const run = (query, data?): Promise<any> => {
    return new Promise((resolve, reject) => {
        //debug('%s,%o', query, data);
        db.run(query, data, function(error) {
            if (error) {
                debug('ERROR %s %o', query, data);
                reject(error);
            } else {
                resolve(this.changes);
            }
        });
    });
  };
  
  export const get = (query, data?): Promise<any> => {
    return new Promise((resolve, reject) => {
        //debug('GET %s %o', query, data);
        db.get(query, data, function(error, row) {
            if (error) {
                debug('ERROR %s %o', query, data);
                reject(error);
            } else {
                resolve(row);
            }
        });
    });
  };
  
  export const all = (query, data?): Promise<any> => {
    return new Promise((resolve, reject) => {
        //debug('ALL %s %o', query, data);
        db.all(query, data, function(error, rows) {
            if (error) {
                debug('ERROR %s %o', query, data);
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
  };
  
  /* End region:db-actions */