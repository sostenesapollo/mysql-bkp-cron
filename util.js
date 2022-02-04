module.exports = {
    getFilename: ({name}) => {
        let date = new Date().toLocaleDateString('pt-BR')
	    let time = new Date().toLocaleTimeString('pt-BR')
	    return `${time.split(':').join(':')}_${date.split('/').join('-')}_${name}.sql.gz`
    }
}