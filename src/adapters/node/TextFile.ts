import { PathLike, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Writer } from 'steno'

import { Adapter, SyncAdapter } from '../../core/Low.js'

export class TextFile implements Adapter<string> {
  #filename: PathLike
  #writer: Writer

  constructor(filename: PathLike) {
    this.#filename = filename
    this.#writer = new Writer(filename)
  }

  async read(): Promise<string | null> {
    let data

    try {
      data = await readFile(this.#filename, 'utf-8')
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
  #tempFilename: PathLike
  #filename: PathLike

  constructor(filename: PathLike) {
    this.#filename = filename
    const f = filename.toString()
    this.#tempFilename = path.join(path.dirname(f), `.${path.basename(f)}.tmp`)
  }

  read(): string | null {
    let data

    try {
      data = readFileSync(this.#filename, 'utf-8')
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw e
    }

    return data
  }

  write(str: string): void {
    writeFileSync(this.#tempFilename, str)
    renameSync(this.#tempFilename, this.#filename)
  }
}
