import fs from 'fs'
import { Writer } from 'steno'

import { Adapter } from '../Low'

export class JSONFile<T> implements Adapter<T> {
  private filename: string
  private writer: Writer

  constructor(filename: string) {
    this.filename = filename
    this.writer = new Writer(filename)
  }

  async read(): Promise<T | null> {
    let data

    try {
      data = await fs.promises.readFile(this.filename, 'utf-8')
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw e
    }

    return JSON.parse(data) as T
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  write(obj: unknown): Promise<void> {
    return this.writer.write(JSON.stringify(obj, null, 2))
  }
}
