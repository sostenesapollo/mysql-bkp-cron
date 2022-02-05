const fs = require('fs');
const {google} = require('googleapis');
const syncExec = require('sync-exec');
const TOKEN_PATH = './token.json';
var drive;
var auth;

const createFolder = async ({name, parent}) => new Promise((resolve, reject)=>{
  drive.files.create({resource: { name,'mimeType': 'application/vnd.google-apps.folder', parents: [parent]},fields: 'id, parents'}, (err, file) => {
    if(err) reject(err)
    resolve(file)
  });
})

const search = ({name, folderId}) => new Promise((resolve, reject) => {  
  let q;
  if(name) q = `name = '${name}'`;
  if(folderId) q = name ? `'${folderId}' in parents and ${q}` : `'${folderId}' in parents`;

  drive.files.list({
    fileId: folderId,
    includeRemoved: false,
    spaces: 'drive',
    fields: 'nextPageToken, files(id, name, mimeType, parents)',
    q
  }, (err, res) => {
    if (err || res.errors) reject(err.errors)
    resolve(res.data.files)
  })

})

const uploadFile = ({name, filename, parent}) => new Promise((resolve, reject)=>{
  let resource = { name, parents: [parent] }      
  let media = { body: fs.createReadStream(filename) };

  drive.files.create({ resource, media, fields: 'id' }, (err, file)=>{ 
    if(err)reject(err)
    resolve(file['data']['id'])
  })
})

const createFolderIfNotExists = ({ name, parent }) => { 
  return new Promise(async (resolve, reject) => {
    let folder = await search({ name, folderId: parent })

    // console.log('*', folder)

    if(parent)
      folder = folder.filter(f => f.parents.includes(parent))
  
    if(folder[0]?.id) {
      console.log(`- Pasta ${name} já existe  | id: ${folder[0].id}`)
      
      resolve({created: false, exists: true, folder: folder[0].id})
    } else {
      console.log(`+ Não existe ${name}, criando...`)
      folder = (await createFolder({ name, parent }))
      console.log(`+ ${name} criado com sucesso | id: ${folder.data.id}`)
      resolve({ created: true, folder: folder.data.id })
    }
  })
}

const deleteFile = ({fileId}) => new Promise((resolve, reject) => {
  drive.files.delete({'fileId': params.id}, (err, file) => {
    if(err) reject(err)
    resolve(file)
  })
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

// authenticate()
//   .then(()=>
//     // createFolderIfNotExists({name: 'newss'})
//     search({ name: 'newss', folderId: '1SJl6NNqEA4XG2FnAJyk0s6lw4jl8448m'}).then(console.log).catch(console.log)
//   )

module.exports = { authenticate, createFolderIfNotExists, uploadFile }