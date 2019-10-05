const Base = require('./Base')
const Ipfs = require('ipfs')

class IPFSAdapter extends Base {
  constructor(ipfs, lastHash, key) {
    super('ipfs')
    this.key = key
    this.lastHash = lastHash || null
    this.ipfs = ipfs
    if (this.lastHash) this.defaultValue = this.read()
  }

  read() {
    if (!this.lastHash) return {}
    if (!this.key) {
      return this.ipfs
        .get(this.lastHash)
        .then(results => {
          return this.deserialize(results[0].content.toString('utf8'))
        })
        .catch(error => error)
    }
  }

  write(data) {
    return new Promise(async (resolve, reject) => {
      let dataSerialized = null
      data.parentHash = this.lastHash
      if (this.key == null) {
        dataSerialized = Ipfs.Buffer.from(this.serialize(data))
      }

      const results = await this.ipfs.add(dataSerialized)
      this.lastHash = results[0].hash
      resolve(results[0].hash)
    })
  }
}

module.exports = IPFSAdapter
