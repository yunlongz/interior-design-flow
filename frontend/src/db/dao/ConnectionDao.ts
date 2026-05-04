import { dbManager } from '../DatabaseManager'
import type { Connection, ConnectionFull } from '@/types'

export class ConnectionDao {
  getAll(): Connection[] {
    const result = dbManager.exec('SELECT id, from_node, to_node, type, description FROM connections')
    if (!result.length) return []
    return result[0].values.map((row) => ({
      id: row[0] as number,
      fromNode: row[1] as string,
      toNode: row[2] as string,
      type: row[3] as string,
      description: (row[4] as string) || '',
    }))
  }

  create(fromNode: string, toNode: string, type: string, description: string): void {
    const escapedType = type.replace(/'/g, "''")
    const escapedDesc = description.replace(/'/g, "''")
    dbManager.runSql(`
      INSERT INTO connections (from_node, to_node, type, description)
      VALUES ('${fromNode}', '${toNode}', '${escapedType}', '${escapedDesc}')
    `)
  }

  deleteById(id: number): void {
    dbManager.runSql(`DELETE FROM connections WHERE id = ${id}`)
  }

  deleteByNodes(fromNode: string, toNode: string): void {
    dbManager.runSql(`
      DELETE FROM connections WHERE from_node = '${fromNode}' AND to_node = '${toNode}'
    `)
  }

  update(id: number, type: string, description: string): void {
    const escapedType = type.replace(/'/g, "''")
    const escapedDesc = description.replace(/'/g, "''")
    dbManager.runSql(`
      UPDATE connections
      SET type = '${escapedType}', description = '${escapedDesc}'
      WHERE id = ${id}
    `)
  }

  getByNode(nodeId: string): { upstream: ConnectionFull[]; downstream: ConnectionFull[] } {
    const upstreamResult = dbManager.exec(`
      SELECT c.id, c.from_node, c.to_node, c.type, c.description,
             n.title, p.name, d.name
      FROM connections c
      LEFT JOIN nodes n ON c.from_node = n.id
      LEFT JOIN phases p ON n.phase_id = p.id
      LEFT JOIN departments d ON n.dept_id = d.id
      WHERE c.to_node = '${nodeId}'
    `)
    const downstreamResult = dbManager.exec(`
      SELECT c.id, c.from_node, c.to_node, c.type, c.description,
             n.title, p.name, d.name
      FROM connections c
      LEFT JOIN nodes n ON c.to_node = n.id
      LEFT JOIN phases p ON n.phase_id = p.id
      LEFT JOIN departments d ON n.dept_id = d.id
      WHERE c.from_node = '${nodeId}'
    `)

    const upstream: ConnectionFull[] = upstreamResult.length
      ? upstreamResult[0].values.map((row) => ({
          id: row[0] as number,
          fromNode: row[1] as string,
          toNode: row[2] as string,
          type: row[3] as string,
          description: (row[4] as string) || '',
          fromTitle: (row[5] as string) || undefined,
          fromDept: (row[6] as string) ? `${row[6]} / ${row[7]}` : (row[7] as string) || undefined,
        }))
      : []

    const downstream: ConnectionFull[] = downstreamResult.length
      ? downstreamResult[0].values.map((row) => ({
          id: row[0] as number,
          fromNode: row[1] as string,
          toNode: row[2] as string,
          type: row[3] as string,
          description: (row[4] as string) || '',
          toTitle: (row[5] as string) || undefined,
          toDept: (row[6] as string) ? `${row[6]} / ${row[7]}` : (row[7] as string) || undefined,
        }))
      : []

    return { upstream, downstream }
  }
}
