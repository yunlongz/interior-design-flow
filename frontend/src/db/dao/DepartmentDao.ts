import { dbManager } from '../DatabaseManager'
import type { Department } from '@/types'

export class DepartmentDao {
  getAll(): Department[] {
    const result = dbManager.exec('SELECT id, name, sort_order FROM departments ORDER BY sort_order')
    if (!result.length) return []
    return result[0].values.map((row) => ({
      id: row[0] as number,
      name: row[1] as string,
      sortOrder: row[2] as number,
    }))
  }

  getById(id: number): Department | null {
    const result = dbManager.exec(`SELECT id, name, sort_order FROM departments WHERE id = ${id}`)
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
      INSERT INTO departments (name, sort_order) VALUES ('${escaped}', ${sortOrder})
    `)
    const result = dbManager.exec('SELECT last_insert_rowid() as id')
    return result[0].values[0][0] as number
  }

  update(id: number, name: string, sortOrder: number): void {
    const escaped = name.replace(/'/g, "''")
    dbManager.runSql(`
      UPDATE departments SET name = '${escaped}', sort_order = ${sortOrder} WHERE id = ${id}
    `)
  }

  delete(id: number): void {
    dbManager.runSql(`DELETE FROM departments WHERE id = ${id}`)
  }

  getNodeCount(id: number): number {
    const result = dbManager.exec(`SELECT COUNT(*) FROM nodes WHERE dept_id = ${id}`)
    return (result[0] && result[0].values && result[0].values[0] && result[0].values[0][0]) as number || 0
  }
}
