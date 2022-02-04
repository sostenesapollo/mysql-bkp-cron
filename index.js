require('dotenv').config()
const { exec } = require('child_process');
const cron = require('node-cron');
const drive = require('./drive')

const backupFolderLocally = './backups/'
const database = process.env.MYSQL_DATABASE
const password = process.env.MYSQL_PASSWORD
const user = process.env.MYSQL_USER
const host = process.env.MYSQL_HOST
const driveFolder = process.env.DRIVE_FOLDER_NAME

console.log('Drive Folder:', driveFolder)

drive.action('createfolderifnotexists',{name: driveFolder}, rst=> {})

function mysqldump(dumpFile) {
	return new Promise(async(resolve, rej) => {
		const exportFrom = {user,password ,host , database}
		exec(`docker exec -i $(docker ps --filter "ancestor=mysql" -q) mysqldump -u root -p${exportFrom.password.replace('\n','')} ${exportFrom.database} | gzip -c > ${dumpFile}`, (err, stdout, stderr) => {
			if (err) { console.log(`Erro ao realizar backup offline: ${err}`); }
			console.log(stdout)

			resolve(true)
		})		
	})		
}

console.log('crontab', process.env.CRON_SETUP)

// Três vezes no dia
cron.schedule(process.env.CRON_SETUP, () => {
// cron.schedule('*/7 * * * * *', () => {
  console.log('running a task 10 secs');
  RealizaBackupDrive()
});


async function RealizaBackupDrive() {
	try {		
		const file = await generateLocalDump()
		drive.action('createfolderifnotexists',{name: driveFolder}, rst=> {
			if(rst.err)	{
				console.log(`Erro ao criar pasta ${driveFolder} no drive`, rst.err);
			}else{	
				drive.action('searchByName', { name: driveFolder }, data=>{					
					let folderid = data[0]['id']	
					drive.action('createfolderifnotexists',{name:driveFolder, parents:[folderid]}, rst=> {						
						if(rst.err) {
							console.log('erro ao criar pasta', rst.err);
						}else{
							drive.action('searchByName', {name: driveFolder}, data=>{
								let folderid = data[0]['id']									
								drive.action("uploadFile",{dir:backupFolderLocally, filename:file, folderid: folderid},r=>{
									console.log("Resultado upload Drive", r)										
								})						
							})
						}
					})
				})
			}
		})
	} catch(error) {
	  console.log("Catch RealizaBackupDriveError",error);	  
	}
}

function generateLocalDump() {
	return new Promise((resolve, reject)=>{	
		let file = nameForDump(driveFolder)		
		let DirAndFilename = nameForDump(backupFolderLocally+driveFolder)
		console.log(DirAndFilename);
		mysqldump(DirAndFilename)
		.then(rst => {						
			console.log('Backup realizado offline.')
			resolve(file)
		})
		.catch(err => {
			reject(console.log('Erro ao realizar backup.' + err))
		})
	})
}

function nameForDump(userCode) { let date = (new Date()).toString().split(' '); date[4] = date[4].replace(/[:]/g, '.'); date = ('__' + date[0] + '_' + date[2] + '_' + date[3] + '__' + date[4] ); console.log('>', userCode + date + '.sql.gz');; return userCode + date + '.sql.gz';}