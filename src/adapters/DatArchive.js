/* global DatArchive */
/* global window */

const Base = require('./Base')

class DatArchive extends Base {
  read() {
  	let archive = new DatArchive(window.location.toString())
  	archive.stat(this.source).then(_ => {
	  	let data = archive.readFile(this.source).then(data => {
				const trimmed = data.trim()
				return trimmed ? this.deserialize(trimmed) : this.defaultValue
	  	})
			.catch(e => {
			  if (e instanceof SyntaxError) {
			    e.message = `Malformed JSON in file: ${this.source}\n${e.message}`
			  }
			  throw e
			})  		
  	}).catch(e => {
  		return archive.writeFile(this.source, this.serialize(this.defaultValue)).then(() => this.defaultValue)
  	})

  }

  write(data) {
    let archive = new DatArchive(window.location.toString())
    return archive.writeFile(this.source, this.serialize(data)).then(() => true)
  }
}

module.exports = DatArchive
