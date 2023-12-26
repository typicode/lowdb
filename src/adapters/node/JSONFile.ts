import { PathLike } from 'fs'

import { DataFile, DataFileSync } from './DataFile.js'

export class JSONFile<T> extends DataFile<T> {
  constructor(filename: PathLike) {
    super(filename, {
      parse: JSON.parse,
      stringify: (data: T) => JSON.stringify(data, null, 2),
    })
  }
}

export class JSONFileSync<T> extends DataFileSync<T> {
  constructor(filename: PathLike) {
    super(filename, {
      parse: JSON.parse,
      stringify: (data: T) => JSON.stringify(data, null, 2),
    })
  }
}
