import type { Database, SqlJsStatic } from 'sql.js'
import initSql from './init.sql?raw'

declare global {
  interface Window {
    initSqlJs: (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>
  }
}

const DB_KEY = 'interior_design_flow_db'

class DatabaseManager {
  private static instance: DatabaseManager
  private db: Database | null = null
  private SQL: SqlJsStatic | null = null
  private initialized = false
  private initPromise: Promise<void> | null = null

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  async init(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise

    this.initPromise = this.doInit()
    return this.initPromise
  }

  private async doInit(): Promise<void> {
    try {
      console.log('[DB] Initializing sql.js...')
      this.SQL = await window.initSqlJs({
        locateFile: (file) => {
          const path = import.meta.env.DEV ? `/sql-wasm.wasm` : `./sql-wasm.wasm`
          console.log('[DB] Loading WASM:', path)
          return path
        },
      })
      console.log('[DB] sql.js initialized successfully')

      // Try restore from IndexedDB
      const saved = await this.loadFromIndexedDB()
      if (saved) {
        console.log('[DB] Restoring from IndexedDB...')
        this.db = new this.SQL.Database(saved)
        console.log('[DB] Restored from IndexedDB')
      } else {
        console.log('[DB] Creating new database...')
        this.db = new this.SQL.Database()
        this.runSql(initSql)
        console.log('[DB] New database created with default data')
      }

      this.initialized = true
    } catch (err) {
      console.error('[DB] Initialization failed:', err)
      throw err
    }
  }

  getDb(): Database {
    if (!this.db) throw new Error('Database not initialized')
    return this.db
  }

  runSql(sql: string): void {
    if (!this.db) throw new Error('Database not initialized')
    this.db.run(sql)
  }

  exec(sql: string): Array<{ columns: string[]; values: any[][] }> {
    if (!this.db) throw new Error('Database not initialized')
    return this.db.exec(sql)
  }

  async persist(): Promise<void> {
    if (!this.db) return
    try {
      const data = this.db.export()
      await this.saveToIndexedDB(data)
      console.log('[DB] Persisted to IndexedDB')
    } catch (err) {
      console.error('[DB] Persist failed:', err)
    }
  }

  async exportDb(): Promise<Uint8Array> {
    if (!this.db) throw new Error('Database not initialized')
    return this.db.export()
  }

  async importDb(data: Uint8Array): Promise<void> {
    if (!this.SQL) throw new Error('SQL.js not initialized')
    this.db = new this.SQL.Database(data)
    await this.persist()
  }

  private async saveToIndexedDB(data: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_KEY, 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data')
        }
      }
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('data', 'readwrite')
        const store = tx.objectStore('data')
        store.put(data, 'db')
        store.put(Date.now(), 'timestamp')
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => {
          db.close()
          reject(tx.error)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  private async loadFromIndexedDB(): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_KEY, 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data')
        }
      }
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('data', 'readonly')
        const store = tx.objectStore('data')
        const getReq = store.get('db')
        getReq.onsuccess = () => {
          db.close()
          resolve(getReq.result || null)
        }
        getReq.onerror = () => {
          db.close()
          reject(getReq.error)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async resetToDefault(): Promise<void> {
    if (!this.SQL) throw new Error('SQL.js not initialized')
    this.db = new this.SQL.Database()
    this.runSql(initSql)
    await this.persist()
  }
}

export const dbManager = DatabaseManager.getInstance()
