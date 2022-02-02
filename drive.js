const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = './token.json';

var params = {}

function authorize(credentials, callback, callback2) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client,callback2);
  })
}

function getAccessToken(oAuth2Client, callback) {
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
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function uploadFile(auth, callback) {
    
    const drive = google.drive({version: 'v3', auth});    
  
    var fileMetadata = { 'name': params['filename'],parents:[params.folderid] }      
    var media = { body: fs.createReadStream(params.dir+params.filename) };        

    console.log('Save in drive, parent:', params.folderid);

    drive.files.create(
      {resource: fileMetadata,media: media, fields: 'id'}, 
      (err, file)=>{ if(err){callback({erro:err})}else{callback(file['data']['id'])} })    
}

function createfolderifnotexists(auth, callback) { 
  action('searchByName', {name: params.name}, folder => {    
    const drive = google.drive({version: 'v3', auth});        
    if(folder[0] && folder[0]['id']) {                
      callback({msg:"pasta existe"})
    } else {
      console.log("Pasta não existe.");    
      action('createFolder',{name: params.name},callback)
    }        
  })
}

function deleteFile(auth, callback) {
 const drive = google.drive({version: 'v3', auth});  
  drive.files.delete({
    'fileId': params.id
  }, function (err, file) {
    callback({success:file, err})    
  }); 
}

function createFolder(auth, callback) {
  const drive = google.drive({version: 'v3', auth});

  var fileMetadata = {
    'name': params.name,
    'mimeType': 'application/vnd.google-apps.folder',    
    parents: params['parents']    
  };
  console.log(`Create folder ${params.name}`);  
  drive.files.create({
    resource: fileMetadata,
    fields: 'id'    
  }, function (err, file) {  
    callback({success:file, err})
  });
}

function listFiles(auth, callback) {
  const drive = google.drive({version: 'v3', auth});
       
  drive.files.list({    
    fields: 'nextPageToken, files(id, name)'    
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    callback(files)    
  });    
}

function searchByName(auth,callback) {  
  const drive = google.drive({version: 'v3', auth});     
  drive.files.list({
    q: `name = '${params.name}'`    
  }, (err, res) => {
    if (err) return { err };
    const files = res.data.files;
    callback(files)
  })     
}

function action(callback,p,callback2) {  
  if(callback == 'listFiles') {
    callback = listFiles
  }
  if(callback == 'uploadFile') {
    callback = uploadFile
  }
  if(callback == 'deleteFile') {
    callback = deleteFile
  }
  if(callback == 'createFolder') {
    callback = createFolder
  }
  if(callback == 'searchByName') {
    callback = searchByName
  }
  if(callback == 'createfolderifnotexists') {
    callback = createfolderifnotexists
  }
  for(i in p) {
    params[i] = p[i];
  }
  // console.log(sale2folder+'/credentials.json')
  // params = p
  fs.readFile('./credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);  
    authorize(JSON.parse(content), callback, ret => callback2(ret) );
  });
}

module.exports = {action}
// action('listFiles',{},data=>console.log(data))
// action('searchByName', {name: "sale2"}, data=>{console.log(data)})
// action(uploadFile, {dir:"./", filename:"package.json", drivefolder: "sale2"}, rst => console.log('Upload success',rst)) 
// action(deleteFile, {id:"1q2dx1wEkSDY8j3bC9_nI5jQOiZNiEAdF"}, s=>console.log(s))
// action('createFolder', {name: "Sale2", parents: ["1s8zkmC0EhazA6RflB71yzULgT6hKvn_y"]}, s=>{console.log(s);})
// action('createfolderifnotexists',{name:'sale2'},c=> console.log(c))