import { name, version } from '../../../config';
import * as express from 'express';
import * as db from '../db';
import * as utils from '../utils';
import * as request from 'request';
import * as Debug from 'debug';

const debug = Debug('routes');
//import * as config from '../../config';
//import Bottleneck from 'bottleneck';
const router = express.Router();

/* Send version header */
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Version', version);
  next();
});

/* GET All user data */

router.get('/v1/data', async (req, res) => {
  try {
    res.json(
      {
        method: 'get',
        success: true,
        data: await db.all('SELECT * from entries')
      }
    )
  } catch (e) {
    res.json(
      {
        method: 'get',
        success: false
      }
    )
  }
});

/* GET Username Data */

router.get('/data/:username', async (req, res) => {
  if (req.params.username) {
    try {
      const usernameData = await db.get('SELECT * from entries WHERE username="' + req.params.username.toLowerCase() + '"')
      debug('username: ', usernameData)
      if (usernameData !== undefined) {
        delete usernameData['id'];
        // Return user's data
        res.json(
          {
            method: 'get',
            success: true,
            data: usernameData
          }
        )
      } else {
        debug('username not found');
        res.json(
          {
            method: 'get',
            success: false,
            message: 'Could not find username in database.'
          }
        )
      }

    } catch (e) {
      res.json(
        {
          method: 'get',
          success: false,
          message: ''
        }
      )
    }
  } else {
    res.json(
      {
        method: 'get',
        success: false,
        message: 'No username found in request.'
      }
    )
  }

});

/* POST insert user */
router.post('/insert', async (req, res) => {
  if (req.body !== undefined) {
    const newEntry: any = {
      ...req.body
    };
    if (newEntry.username && newEntry.name && newEntry.address) {
      if (utils.isValidEthAddress(newEntry.address.toLowerCase())) {
        if (await utils.isUsernameFree(newEntry.username.toLowerCase())) {
          try {
            const id = await utils.getID(newEntry.username.toLowerCase())
            await db.run(
              "INSERT INTO entries(id, name, address, username, description) VALUES($id, $name, $address, $username, $description) ON CONFLICT(id) DO UPDATE SET address=$address, name=$name, username=$username, description=$description",{
                $address: newEntry.address.toLowerCase(), $name: newEntry.name,$username: newEntry.username.toLowerCase(), $description: newEntry.description, $id: id
              }
            )
            const updateCode = await utils.generateBackupPhrase();
            await db.run(
              "INSERT INTO backup(id, phrase) VALUES($id, $phrase) ON CONFLICT(id) DO UPDATE SET phrase=$phrase WHERE id=$id",{
                $id: id, $phrase: updateCode
              }
            )
            res.json({
              method: 'insert',
              success: true,
              message: 'Successfully added new entry.',
              updateCode
            })
          } catch (e) {
            res.json({
              method: 'insert',
              success: false,
              message: 'Failed to add entry.'
            })
          }
        } else {
          res.json({
            method: 'insert',
            success: false,
            message: 'Username is already in use.'
          })
        }
      } else {
        res.json({
          method: 'insert',
          success: false,
          message: 'Invalid eth address entered. Eth addresses should be 42 characters long with "0x" prepended.'
        })
      }
    } else {
      res.json({
        method: 'insert',
        success: false,
        message: 'Invalid record entered. Please include the following fields: "name", "username", "description", and "address".'
      })
    }
  } else {
    res.json({
      method: 'insert',
      success: false,
      message: 'No request body found.'
    })
  }
});

/* Update Entry */
/* PUT update user */
router.put('/update', async (req, res) => {
  if (req.body !== undefined) {
    const newEntry: any = {
      ...req.body
    };
    if (newEntry.username && newEntry.name && newEntry.address && newEntry.updateCode) {
      if (await utils.isValidUpdateCode(newEntry.updateCode)) {

        if (utils.isValidEthAddress(newEntry.address.toLowerCase())) {
          try {
            const id = await utils.getID(newEntry.username.toLowerCase())
            await db.run(
              "INSERT INTO entries(id, name, address, description, username) VALUES($id, $name, $address, $description, $username) ON CONFLICT(id) DO UPDATE SET address=$address, name=$name, description=$description, username=$username WHERE id=$id",{
                $address: newEntry.address.toLowerCase(),$name: newEntry.name,$description: newEntry.description,$username: newEntry.username.toLowerCase(), $id: id
              }
            )
            const updateCode = await utils.generateBackupPhrase();
            await db.run(
              "INSERT INTO backup(id, phrase) VALUES($id, $phrase) ON CONFLICT(id) DO UPDATE SET phrase=$phrase WHERE id=$id",{
                $id: id, $phrase: updateCode
              }
            )
            res.json({
              method: 'insert',
              success: true,
              message: 'Successfully added new entry.',
              updateCode
            })
          } catch (e) {
            res.json({
              method: 'insert',
              success: false,
              message: 'err: ' + e
            })
          }
        } else {
          res.json({
            method: 'insert',
            success: false,
            message: 'Invalid eth address entered. Eth addresses should be 42 characters long with "0x" prepended.'
          })
        }       
      } else {
        res.json({
          method: 'insert',
          success: false,
          message: 'Invalid updateCode for this user. Please email support at support@ethonate.com'
        })
      }
    } else {
      res.json({
        method: 'insert',
        success: false,
        message: 'Invalid record entered. Please include the following fields: "name", "username", "updateCode", "description", and "address".'
      })
    }
  } else {
    res.json({
      method: 'insert',
      success: false,
      message: 'No request body found.'
    })
  }
});

router.get('/*', (req, res) =>
  res.json({
      success: false,
      message: 'This is an invalid api endpoint.'
  })
);

export default router;