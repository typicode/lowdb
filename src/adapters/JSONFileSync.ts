import fs from 'fs'
import path from 'path'

import { SyncAdapter } from '../LowSync'

export class JSONFileSync<T> implements SyncAdapter<T> {
  private tempFilename: string
  filename: string

  constructor(filename: string) {
    this.filename = filename
    this.tempFilename = path.join(
      path.dirname(filename),
      `.${path.basename(filename)}.tmp`,
    )
  }

  read(): T | null {
    let data

    try {
      data = fs.readFileSync(this.filename, 'utf-8')
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw e
    }

    return JSON.parse(data) as T
  }

  write(obj: T): void {
    fs.writeFileSync(this.tempFilename, JSON.stringify(obj, null, 2))
    fs.renameSync(this.tempFilename, this.filename)
  }
}
