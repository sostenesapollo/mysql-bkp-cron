### Backup Mysql Running In A Docker Container and upload to Google Drive

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
- [ ] Upload Dumps to respective month folder
