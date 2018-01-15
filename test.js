const getsheet = require('./index');

// getsheet.getRaw('19R40EvDrld96u1qg--hJpGDTOwvgzz532ZAc2T6FWU4', '.client_secret.json').then(data => {
//   // console.log(data);
// });

getsheet.getSimplified('19R40EvDrld96u1qg--hJpGDTOwvgzz532ZAc2T6FWU4', '.client_secret.json').then(data => {
  console.log(data);
  console.log(data.sheets[0].rows);
});
