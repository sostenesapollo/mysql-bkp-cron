### Backup Mysql Running In A Docker Container and upload to Google Drive

## !! Tested with node version 16.13.0

<img src="https://raw.githubusercontent.com/sostenesapollo/mysql-bkp-cron/a87f04027f7321e60bf6c21eba7fdfa7132752cd/static/screenshot_001.jpeg" alt="drawing" style="width:400px;"/>

##### You can Run Mysql using this docker-compose image:
[sostenesapollo/docker-compose-mysql](https://github.com/sostenesapollo/docker-compose-mysql)

##### Add Google Drive `token.json` and `credentials.json` files in root folder.
##### Update db.json file

## Creating folders inside folders
- [x] Creating folders inside folders
- [x] Creating dynamic Year folder
- [x] Creating dynamic Month folder
- [x] Upload Dumps to respective month folder
- [x] Minify as tar.gz
- [x] Remove Local Dumps
- [x] Allow multi db
- [ ] Send a mail on success
- [ ] Send a mail on failure
- [ ] Remove Local Dumps
