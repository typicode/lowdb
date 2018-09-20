import * as fs from 'fs'
import * as writeFileAtomic from 'write-file-atomic'
import { ISyncAdapter } from '../LowSync'

export default class JSONFileSync implements ISyncAdapter {
  public file: string

  constructor(file: string) {
    this.file = file
  }

  public read() {
    if (!fs.existsSync(this.file)) {
      return null
    }

    return JSON.parse(fs.readFileSync(this.file).toString())
  }

  public write(data: any) {
    writeFileAtomic.sync(this.file, JSON.stringify(data, null, 2))
  }
}
