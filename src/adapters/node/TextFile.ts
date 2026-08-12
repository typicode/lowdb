import { PathLike, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomBytes } from 'node:crypto'

import { Adapter, SyncAdapter } from '../../core/Low.js'

// Returns a temporary file
// Example: for /some/file will return /some/.file.<random>.tmp
function getTempFilename(file: PathLike): string {
  const f = file.toString()
  const randomStr = randomBytes(4).toString('hex')
  return path.join(path.dirname(f), `.${path.basename(f)}.${randomStr}.tmp`)
}

// Retries an asynchronous operation with a delay between retries and a maximum retry count
async function retryAsyncOperation(
  fn: () => Promise<void>,
  maxRetries: number,
  delayMs: number
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      } else {
        throw error // Rethrow the error if max retries reached
      }
    }
  }
}

class Writer {
  #filename: string
  #locked = false
  #prev: [() => void, (err: Error) => void] | null = null
  #next: [() => void, (err: Error) => void] | null = null
  #nextPromise: Promise<void> | null = null
  #nextData: string | null = null

  constructor(filename: PathLike) {
    this.#filename = filename.toString()
  }

  // File is locked, add data for later
  #add(data: string): Promise<void> {
    // Only keep most recent data
    this.#nextData = data

    // Create a singleton promise to resolve all next promises once next data is written
    this.#nextPromise ||= new Promise((resolve, reject) => {
      this.#next = [resolve, reject]
    })

    // Return a promise that will resolve at the same time as next promise
    return new Promise((resolve, reject) => {
      this.#nextPromise?.then(resolve).catch(reject)
    })
  }

  // File isn't locked, write data
  async #write(data: string): Promise<void> {
    // Lock file
    this.#locked = true
    try {
      // Atomic write
      const tempFilename = getTempFilename(this.#filename)
      await writeFile(tempFilename, data, 'utf-8')
      await retryAsyncOperation(
        async () => {
          await rename(tempFilename, this.#filename)
        },
        10,
        100
      )

      // Call resolve
      this.#prev?.[0]()
    } catch (err) {
      // Call reject
      if (err instanceof Error) {
        this.#prev?.[1](err)
      }
      throw err
    } finally {
      // Unlock file
      this.#locked = false

      this.#prev = this.#next
      this.#next = this.#nextPromise = null

      if (this.#nextData !== null) {
        const nextData = this.#nextData
        this.#nextData = null
        await this.write(nextData)
      }
    }
  }

  async write(data: string): Promise<void> {
    return this.#locked ? this.#add(data) : this.#write(data)
  }
}

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
  #filename: PathLike

  constructor(filename: PathLike) {
    this.#filename = filename
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
    const tempFilename = getTempFilename(this.#filename)
    writeFileSync(tempFilename, str)
    renameSync(tempFilename, this.#filename)
  }
}
