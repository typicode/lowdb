const steno = require('steno')
const { stringify } = require('./json')

module.exports = {
  read: require('./file-sync').read,
  write: (dest, obj, serialize = stringify) => {
    return new Promise((resolve, reject) => {
      const data = serialize(obj)

      steno.writeFile(dest, data, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}
