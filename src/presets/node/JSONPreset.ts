import { Memory, MemorySync } from '../../adapters/Memory.js'
import { JSONFile, JSONFileSync } from '../../adapters/node/JSONFile.js'
import { Low, LowSync } from '../../core/Low.js'

export async function JSONPreset<Data>(
  filename: string | URL,
  defaultData: Data,
  dir?: string | URL,
): Promise<Low<Data>> {
  const adapter =
    process.env.NODE_ENV === 'test'
      ? new Memory<Data>()
      : new JSONFile<Data>(new URL(filename, dir))
  const db = new Low<Data>(adapter, defaultData)
  await db.read()
  return db
}

export function JSONSyncPreset<Data>(
  filename: string | URL,
  defaultData: Data,
  dir?: string | URL,
): LowSync<Data> {
  const adapter =
    process.env.NODE_ENV === 'test'
      ? new MemorySync<Data>()
      : new JSONFileSync<Data>(new URL(filename, dir))
  const db = new LowSync<Data>(adapter, defaultData)
  db.read()
  return db
}
