### Backup Mysql Running In A Docker Container and upload to Google Drive

<img src="https://raw.githubusercontent.com/sostenesapollo/mysql-bkp-cron/a87f04027f7321e60bf6c21eba7fdfa7132752cd/static/screenshot_001.jpeg" alt="drawing" style="width:400px;"/>

##### You can Run Mysql using this docker-compose image:
url(https://github.com/sostenesapollo/docker-compose-mysql)[sostenesapollo/docker-compose-mysql]

#### 1 Create .env File
`.env Example File`

```
DRIVE_FOLDER_NAME=folder_name
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=example
MYSQL_DATABASE=db_name
CRON_SETUP='0 0 8,9,12,15,18 * * *'
# CRON_SETUP='*/7 * * * * *'
```
##### Add Google Drive `token.json` and `credentials.json` files in root folder.

## Creating folders inside folders
- [x] Creating folders inside folders
- [x] Creating dynamic Year folder
- [x] Creating dynamic Month folder
- [x] Upload Dumps to respective month folder
- [x] Minify as tar.gz
- [ ] Remove Local Dumps