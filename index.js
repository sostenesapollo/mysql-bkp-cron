require('dotenv').config()
const syncExec = require('sync-exec');
const mysql = require('mysql2');
const cron = require('node-cron');
const fs = require('fs');
const drive = require('./drive')
const { getFilename, getCurrentMonthLong, getCurrentYear } = require('./util')

const dumpFolder = './backups/'

const host = 'localhost'
const database = process.env.MYSQL_DATABASE
const password = process.env.MYSQL_PASSWORD
const user = process.env.MYSQL_USER
const driveFolder = process.env.DRIVE_FOLDER_NAME

console.log('Drive Folder:', driveFolder)

// console.log('crontab', process.env.CRON_SETUP)
// cron.schedule(process.env.CRON_SETUP, () => {
//   RealizaBackupDrive()
// });

const testMysqlConnection = async () => {
	const pool = mysql.createConnection({host, user,password,database});
	const promisePool = pool.promise();
	const [rows,fields] = await promisePool.query("SELECT 1");
}

const mysqldump = async () => {
	try {
		const name = getFilename({name: `${database}`})
		const filename = `${dumpFolder}${name}`
		
		if (!fs.existsSync(dumpFolder)) fs.mkdirSync(dumpFolder)
		
		console.log('- Dumping database...', filename)

		await testMysqlConnection()
		await syncExec(`docker exec -i $(docker ps --filter "ancestor=mysql" -q) mysqldump -u ${user} -p${password.replace('\n','')} ${database} | gzip -c > ${filename}`)
		await drive.authenticate()

		const { folder: baseFolder } = await drive.createFolderIfNotExists({name: driveFolder})
		const { folder: yearFolder } = await drive.createFolderIfNotExists({name: getCurrentYear(), parent: baseFolder})
		const { folder: monthFolder } = await drive.createFolderIfNotExists({name: getCurrentMonthLong(), parent: yearFolder})

		const id = await drive.uploadFile({name, filename, parent: monthFolder})
		console.log(id)
	}catch(e) {
		console.log('error to dump', e)
	}
}

mysqldump()
