const CACHE_FOLDER = '.cache';

const fs = require('fs');
const auth = require('./auth');
const sheets = require('googleapis').sheets('v4');


function retrieveSpreadsheet(spreadsheetId, clientSecretFilePath) {
  return auth(clientSecretFilePath).then(auth => {
    return new Promise((resolve, reject) => {
      sheets.spreadsheets.get({
        auth,
        spreadsheetId,
        includeGridData: true
      }, (err, res) => {
        if (err) {
          console.log('The API returned an error: ' + err);
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  });
}


function getCachedData(id) {
  return new Promise((resolve, reject) => {
    fs.readFile(CACHE_FOLDER + '/' + id + '.json', 'utf8', (err, data) => {
      if (err) {
        resolve(undefined);
        return;
      }
      resolve( JSON.parse(data) );
    });
  });
}


function setCachedData(id, data) {
  return new Promise((resolve, reject) => {
    try {
      fs.mkdirSync(CACHE_FOLDER);
    } catch (err) {
      if (err.code != 'EEXIST') {
        reject(err);
        return;
      }
    }
    
    fs.writeFile(CACHE_FOLDER + '/' + id + '.json', JSON.stringify(data, null, 2), err => {
      if (err) {
        console.log('error', err);
        reject(err);
        return;
      }
      resolve(data);
      console.log("cache updated");
    });
  });
}


function getSpreadsheet(spreadsheetId, clientSecretFilePath, refreshCache = false) {
  return getCachedData(spreadsheetId).then(data => {
    if (refreshCache || !data) {
      return retrieveSpreadsheet(spreadsheetId, clientSecretFilePath).then( data => setCachedData(spreadsheetId, data) );
    }
    return data;
  });
}


// function simplifySpreadsheet(data) {
// }


module.exports = {
  getSpreadsheet
};
