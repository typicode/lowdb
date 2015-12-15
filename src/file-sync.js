const fs = require('graceful-fs')
const { parse, stringify } = require('./json')

module.exports = {
  read: (source, deserialize = parse) => {
    if (fs.existsSync(source)) {
      // Read database
      const data = fs.readFileSync(source, 'utf-8').trim() || '{}'

      try {
        return deserialize(data)
      } catch (e) {
        if (e instanceof SyntaxError) {
          e.message = `Malformed JSON in file: ${source}\n${e.message}`
        }
        throw e
      }
    } else {
      // Initialize empty database
      fs.writeFileSync(source, '{}')
      return {}
    }
  },
  write: (dest, obj, serialize = stringify) => {
    const data = serialize(obj)
    fs.writeFileSync(dest, data)
  }
}
