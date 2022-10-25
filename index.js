require('dotenv').config()
const syncExec = require('sync-exec');
const mysql = require('mysql2');
const cron = require('node-cron');
const fs = require('fs');
const drive = require('./drive')
const { getFilename, getCurrentMonthLong, getCurrentYear } = require('./util')

const databasesConfigs = require('./db.json')

const testMysqlConnection = async ({host, user, password, database}) => {
	const pool = mysql.createConnection({host, user,password,database});
	const promisePool = pool.promise();
	const [rows,fields] = await promisePool.query("SELECT 1");
}

const mysqldump = async ({
	dumpFolder,
	host,
	user,
	password,
	database
}) => {
	try {
		if (!fs.existsSync(dumpFolder)) fs.mkdirSync(dumpFolder)
		
		console.log('- Dumping database...', filename)

		await testMysqlConnection({host, user, password, database})
		await syncExec(`docker exec -i $(docker ps --filter "ancestor=mysql" -q) mysqldump -u ${user} -p${password.replace('\n','')} ${database} | gzip -c > ${filename}`)
		await drive.authenticate()

		const { folder: baseFolder } = await drive.createFolderIfNotExists({name: driveFolder})
		const { folder: yearFolder } = await drive.createFolderIfNotExists({name: getCurrentYear(), parent: baseFolder})
		const { folder: monthFolder } = await drive.createFolderIfNotExists({name: getCurrentMonthLong(), parent: yearFolder})

		const id = await drive.uploadFile({name, filename, parent: monthFolder})

		console.log(`✅ Uploaded to Drive. | ${id} | database: ${database}`)

		if(cleanFolder === 'true') {
			console.log('Cleaning local Folder...')
			await syncExec(`rm ${dumpFolder}/*`)
			console.log('Local folder cleaned.')
		}

	}catch(e) {
		console.log('error to dump', e)
	}
}


for(let databaseConfig of databasesConfigs) {
	
	console.log('📁 Drive Folder:', databaseConfig.driveFolder)
	console.log('🚩 Crontab', databaseConfig.cronSetup)

	cron.schedule(process.env.CRON_SETUP, () => mysqldump(databaseConfig) )

}
