const CACHE_FOLDER = __dirname + '/.cache';

const fs = require('fs');
const path = require('path');
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


// store object in file
function storeJSON(data, filepath) {
  return new Promise((resolve, reject) => {
    try {
      fs.mkdirSync(path.dirname(filepath));
    } catch (err) {
      if (err.code != 'EEXIST') {
        reject(err);
        return;
      }
    }
    
    fs.writeFile(filepath, JSON.stringify(data, null, 2), err => {
      if (err) {
        console.log('error', err);
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}


function setCachedData(id, data) {
  return storeJSON(data, CACHE_FOLDER + '/' + id + '.json').then(data => {
    console.log("cache updated");
    return data;
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


function storeData(data, folder) {
  return storeJSON(data, folder + '/' + data.spreadsheetId + '.json');
}

// default options for getSpreadsheet() and getRaw()
let defaults = {
  spreadsheetId: "",
  clientSecretPath: "",
  refreshCache: false,
  saveFolder: ""
};

function getSpreadsheet(options) {
  options = Object.assign({}, defaults, options);
  
  return getCachedData(options.spreadsheetId).then(data => {
    let dataPromise;
    
    if (options.refreshCache || !data) {
      dataPromise = retrieveSpreadsheet(options.spreadsheetId, options.clientSecretPath)
        .then( data => setCachedData(options.spreadsheetId, data) )
    } else {
      dataPromise = Promise.resolve(data);
    }
    
    return dataPromise.then( data => {
      if (options.saveFolder) return storeData(data, options.saveFolder);
      return data;
    });
  });
}


/*
  {
    spreadsheetId
    title
    sheets: []
      sheetId
      title
      rows: []
  }
*/
function simplify(data) {
  let sheets = data.sheets.map(sheet => {
    let rows = sheet.data[0].rowData.map(row => {
      return row.values.map( value => {
        let val = value.effectiveValue;
        if ( !val ) return '';
        return val.stringValue ? val.stringValue :''; // replaces null values with ''
      });
    });
    
    return {
      sheedId: sheet.properties.sheetId,
      title: sheet.properties.title,
      properties: sheet.properties,
      rows
    }
  });
  
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties.title,
    properties: data.properties,
    sheets
  };
}

function getSimplified(options) {
  options = Object.assign({}, defaults, options);
  optionsNoSave = Object.assign({}, options, { saveFolder: '' });
  
  return getSpreadsheet(optionsNoSave)
    .then( data => simplify(data) )
    .then( data => {
      if (options.saveFolder) return storeData(data, options.saveFolder);
      return data;
    });
}


module.exports = {
  getRaw: getSpreadsheet,
  getSimplified
};
