import * as fs from 'fs'
import mutexify = require('mutexify')
import * as writeFileAtomic from 'write-file-atomic'
import { IAdapter } from '../Low'

export default class JSONFile implements IAdapter {
  public file: string
  private lock = mutexify()

  constructor(file: string) {
    this.file = file
  }

  public read() {
    return new Promise<any>((resolve, reject) => {
      fs.readFile(this.file, (err, data) => {
        if (err) {
          // File doesn't exist
          if (err.code === 'ENOENT') {
            return resolve(null)
          }

          // Other errors
          return reject(err)
        }

        resolve(JSON.parse(data.toString()))
      })
    })
  }

  public write(data: any) {
    return new Promise<void>((resolve, reject) => {
      // Lock file
      this.lock(release => {
        // Write atomically
        writeFileAtomic(this.file, JSON.stringify(data, null, 2), err => {
          // Release file
          release()

          if (err) {
            return reject(err)
          }

          resolve()
        })
      })
    })
  }
}
