const fs = require('graceful-fs')
const pify = require('pify')
const steno = require('steno')
const Base = require('./Base')

const readFile = pify(fs.readFile)
const writeFile = pify(steno.writeFile)

class FileAsync extends Base {
  async read() {
    // fs.exists is deprecated but not fs.existsSync
    if (fs.existsSync(this.source)) {
      // Read database
      try {
        const data = (await readFile(this.source, 'utf-8')).trim()
        // Handle blank file
        return data ? this.deserialize(data) : this.defaultValue
      } catch (e) {
        if (e instanceof SyntaxError) {
          e.message = `Malformed JSON in file: ${this.source}\n${e.message}`
        }
        throw e
      }
    } else {
      // Initialize
      await writeFile(this.source, this.serialize(this.defaultValue))
      return this.defaultValue
    }
  }

  write(data) {
    return writeFile(this.source, this.serialize(data))
  }
}

module.exports = FileAsync
