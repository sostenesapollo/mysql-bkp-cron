require('dotenv').config()
const { execSync } = require('child_process');
const cron = require('node-cron');
const fs = require('fs');
const drive = require('./drive')
const { getFilename } = require('./util')

const dumpFolder = './backups/'

const database = process.env.MYSQL_DATABASE
const password = process.env.MYSQL_PASSWORD
const user = process.env.MYSQL_USER
const driveFolder = process.env.DRIVE_FOLDER_NAME

console.log('Drive Folder:', driveFolder)

// console.log('crontab', process.env.CRON_SETUP)
// cron.schedule(process.env.CRON_SETUP, () => {
//   RealizaBackupDrive()
// });

const mysqldump = async () => {
	try {
		const filename = `${dumpFolder}${ getFilename({name: `${database}`}) }`
		
		if (!fs.existsSync(dumpFolder)) fs.mkdirSync(dumpFolder)

		console.log('Dumping database...', filename)

		const result = await execSync(`docker exec -i $(docker ps --filter "ancestor=mysql" -q) mysqldump -u ${user} -p${password.replace('\n','')} ${database} | gzip -c > ${filename}`)	
		
		console.log(`Creating folder ${driveFolder} in drive if not exists...`)
		await drive.authenticate()
		const folder = await drive.createFolderIfNotExists({name: driveFolder})

		console.log(folder)
	}catch(e) {
		console.log('error to dump', e)
	}
}

mysqldump()
