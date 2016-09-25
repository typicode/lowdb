const fs = require('fs')
const { parse, stringify } = require('./json')

module.exports = {
  read: (source, deserialize = parse) => {
    let data = '{}'
    
    try {
      // Read existing database
      data = fs.readFileSync(source, 'utf-8').trim() || data
    } catch (e) {
      // Initialize empty database
      fs.writeFileSync(source, data)
    }
    
    try {
      return deserialize(data)
    } catch (e) {
      if (e instanceof SyntaxError) {
        e.message = `Malformed JSON in file: ${source}\n${e.message}`
      }
      throw e
    }
  },
  write: (dest, obj, serialize = stringify) => {
    const data = serialize(obj)
    fs.writeFileSync(dest, data)
  }
}
