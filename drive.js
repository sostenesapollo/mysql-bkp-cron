const fs = require('fs');
const {google} = require('googleapis');
const TOKEN_PATH = './token.json';
var drive;
var auth;


const search = ({name, fileId}) => new Promise((resolve, reject) => {  
  
  let q;
  
  if(name) q = `name = '${name}'`;
  if(fileId) q = name ? `and '${fileId}' in parents` : `'${fileId}' in parents`;

  drive.files.list({
    fileId,
    includeRemoved: false,
    spaces: 'drive',
    fields: 'nextPageToken, files(id, name, mimeType)',
    q
  }, (err, res) => {
    if (err || res.errors) reject(err.errors)
    resolve(res.data.files)
  })

})

const uploadFile = (callback) => {
  var fileMetadata = { 'name': params['filename'],parents:[params.folderid] }      
  var media = { body: fs.createReadStream(params.dir+params.filename) };        

  drive.files.create({resource: fileMetadata,media: media, fields: 'id'}, (err, file)=>{ 
    if(err){callback({erro:err})}else{callback(file['data']['id'])} 
  })
}

const createFolderIfNotExists = ({ name, parents }) => { 
  return new Promise(async (resolve, reject) => {
      const folder = await search({name})
      if(folder.length) {
        resolve({created: false, exists: true})
      } else {
        await createFolder({ name, parents })
        resolve({created: true})
      }
  })
}

const deleteFile = ({fileId}) => new Promise((resolve, reject) => {
  drive.files.delete({'fileId': params.id}, (err, file) => {
    if(err) reject(err)
    resolve(file)
  })
})

const createFolder = async ({name, parents}) => new Promise((resolve, reject)=>{
  drive.files.create({resource: { name,'mimeType': 'application/vnd.google-apps.folder', parents},fields: 'id'}, (err, file) => {
    if(err) reject(err)
    resolve(file)
  });
})
  
const listFiles = () => new Promise((resolve, reject) => {
  drive.files.list({fields: 'nextPageToken, files(id, name)'}, (err, res) => {
    if(err) reject(err)
    const files = res.data.files;
    resolve(files)
  });    
})

const authenticate = async () => {
  try {
    console.log('authenticating...')
    const credentials = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'))
    const { client_secret, client_id, redirect_uris} = credentials.installed;
    auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'))
    auth.setCredentials(token);
    drive = google.drive({version: 'v3', auth});
    console.log('authenticated.')
  } catch(e) {
    console.log('error to authenticate.', e)
  }
}

authenticate().then(async ()=>{

  const rs = await search({name: 'hakuna'})

  console.log(rs)

})

module.exports = { authenticate }