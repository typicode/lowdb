import fs from 'node:fs'
import path from 'node:path'

import { SyncAdapter } from '../LowSync.js'

export class TextFileSync implements SyncAdapter<string> {
  #tempFilename: string
  #filename: string

  constructor(filename: string) {
    this.#filename = filename
    this.#tempFilename = path.join(
      path.dirname(filename),
      `.${path.basename(filename)}.tmp`,
    )
  }

  read(): string | null {
    let data

    try {
      data = fs.readFileSync(this.#filename, 'utf-8')
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw e
    }

    return data
  }

  write(str: string): void {
    fs.writeFileSync(this.#tempFilename, str)
    fs.renameSync(this.#tempFilename, this.#filename)
  }
}
