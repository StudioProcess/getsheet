const getsheet = require('./index');

// getsheet.getRaw({
//   spreadsheetId: '19R40EvDrld96u1qg--hJpGDTOwvgzz532ZAc2T6FWU4',
//   clientSecretPath: '.client_secret.json',
//   saveFolder: '.',
//   refreshCache: true
// }).then(data => {
//   console.log(data);
// }).catch(err => {
//   console.log(err);
// });


getsheet.getSimplified({
  spreadsheetId: '19R40EvDrld96u1qg--hJpGDTOwvgzz532ZAc2T6FWU4',
  clientSecretPath: '.client_secret.json',
  saveFolder: '.',
  refreshCache: true
}).then(data => {
  console.log(data);
}).catch(err => {
  console.log(err);
});
