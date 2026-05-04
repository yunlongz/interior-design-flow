import { dbManager } from '../DatabaseManager'
import type { Phase } from '@/types'

export class PhaseDao {
  getAll(): Phase[] {
    const result = dbManager.exec('SELECT id, name, sort_order FROM phases ORDER BY sort_order')
    if (!result.length) return []
    return result[0].values.map((row) => ({
      id: row[0] as number,
      name: row[1] as string,
      sortOrder: row[2] as number,
    }))
  }

  getById(id: number): Phase | null {
    const result = dbManager.exec(`SELECT id, name, sort_order FROM phases WHERE id = ${id}`)
    if (!result.length || !result[0].values.length) return null
    const row = result[0].values[0]
    return {
      id: row[0] as number,
      name: row[1] as string,
      sortOrder: row[2] as number,
    }
  }

  create(name: string, sortOrder: number): number {
    const escaped = name.replace(/'/g, "''")
    dbManager.runSql(`
      INSERT INTO phases (name, sort_order) VALUES ('${escaped}', ${sortOrder})
    `)
    const result = dbManager.exec('SELECT last_insert_rowid() as id')
    return result[0].values[0][0] as number
  }

  update(id: number, name: string, sortOrder: number): void {
    const escaped = name.replace(/'/g, "''")
    dbManager.runSql(`
      UPDATE phases SET name = '${escaped}', sort_order = ${sortOrder} WHERE id = ${id}
    `)
  }

  delete(id: number): void {
    dbManager.runSql(`DELETE FROM phases WHERE id = ${id}`)
  }

  getNodeCount(id: number): number {
    const result = dbManager.exec(`SELECT COUNT(*) FROM nodes WHERE phase_id = ${id}`)
    return (result[0] && result[0].values && result[0].values[0] && result[0].values[0][0]) as number || 0
  }
}
