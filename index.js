const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

//Link to sheet: https://docs.google.com/spreadsheets/d/1cHVYCJCgNTLwkG66fZsVA-1nPLhSayKDVR3mqUj4EcA

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), writeData);
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Writes data to our Google sheet
 */
function writeData(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  let values = [
    [
      //Values to create sheet: 
      
      'First',
      'Second',
      'Third',
      
    ],
  ];
  const resource = {
    values,
  };
  sheets.spreadsheets.values.append({
    spreadsheetId: '1cHVYCJCgNTLwkG66fZsVA-1nPLhSayKDVR3mqUj4EcA',
    range: 'A1:A3',
    valueInputOption: 'RAW',
    resource: resource,
  }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log('%d cells updated on range: %s', result.data.updates.updatedCells, result.data.updates.updatedRange);
    }
  });
}