import fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import path from 'node:path'

import { Writer } from 'steno'

import { Adapter, SyncAdapter } from '../../core/Low.js'

export class TextFile implements Adapter<string> {
  #filename: fs.PathLike
  #writer: Writer

  constructor(filename: fs.PathLike) {
    this.#filename = filename
    this.#writer = new Writer(filename)
  }

  async read(): Promise<string | null> {
    let data

    try {
      data = await fsPromises.readFile(this.#filename, 'utf-8')
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw e
    }

    return data
  }

  write(str: string): Promise<void> {
    return this.#writer.write(str)
  }
}

export class TextFileSync implements SyncAdapter<string> {
  #tempFilename: fs.PathLike
  #filename: fs.PathLike

  constructor(filename: fs.PathLike) {
    this.#filename = filename
    const f = filename.toString()
    this.#tempFilename = path.join(path.dirname(f), `.${path.basename(f)}.tmp`)
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
