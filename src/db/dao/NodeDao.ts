import { dbManager } from '../DatabaseManager'
import type { FlowNodeFull } from '@/types'

export class NodeDao {
  getAll(): FlowNodeFull[] {
    const result = dbManager.exec(`
      SELECT n.id, n.title, n.type, n.detail, n.sort_order,
             p.id, p.name, d.id, d.name
      FROM nodes n
      JOIN phases p ON n.phase_id = p.id
      JOIN departments d ON n.dept_id = d.id
      ORDER BY p.sort_order, d.sort_order, n.sort_order
    `)
    if (!result.length) return []
    return result[0].values.map((row) => ({
      id: row[0] as string,
      title: row[1] as string,
      type: row[2] as any,
      detail: (row[3] as string) || '',
      sortOrder: row[4] as number,
      phaseId: row[5] as number,
      phaseName: row[6] as string,
      deptId: row[7] as number,
      deptName: row[8] as string,
    }))
  }

  getByPhase(phaseId: number): FlowNodeFull[] {
    const result = dbManager.exec(`
      SELECT n.id, n.title, n.type, n.detail, n.sort_order,
             p.id, p.name, d.id, d.name
      FROM nodes n
      JOIN phases p ON n.phase_id = p.id
      JOIN departments d ON n.dept_id = d.id
      WHERE n.phase_id = ${phaseId}
      ORDER BY d.sort_order, n.sort_order
    `)
    if (!result.length) return []
    return result[0].values.map((row) => ({
      id: row[0] as string,
      title: row[1] as string,
      type: row[2] as any,
      detail: (row[3] as string) || '',
      sortOrder: row[4] as number,
      phaseId: row[5] as number,
      phaseName: row[6] as string,
      deptId: row[7] as number,
      deptName: row[8] as string,
    }))
  }

  getById(id: string): FlowNodeFull | null {
    const result = dbManager.exec(`
      SELECT n.id, n.title, n.type, n.detail, n.sort_order,
             p.id, p.name, d.id, d.name
      FROM nodes n
      JOIN phases p ON n.phase_id = p.id
      JOIN departments d ON n.dept_id = d.id
      WHERE n.id = '${id}'
    `)
    if (!result.length || !result[0].values.length) return null
    const row = result[0].values[0]
    return {
      id: row[0] as string,
      title: row[1] as string,
      type: row[2] as any,
      detail: (row[3] as string) || '',
      sortOrder: row[4] as number,
      phaseId: row[5] as number,
      phaseName: row[6] as string,
      deptId: row[7] as number,
      deptName: row[8] as string,
    }
  }

  create(id: string, title: string, type: string, detail: string, phaseId: number, deptId: number): void {
    const escapedTitle = title.replace(/'/g, "''")
    const escapedDetail = detail.replace(/'/g, "''")
    const sortOrder = this.getMaxSortOrder(phaseId, deptId) + 1
    dbManager.runSql(`
      INSERT INTO nodes (id, title, type, detail, phase_id, dept_id, sort_order)
      VALUES ('${id}', '${escapedTitle}', '${type}', '${escapedDetail}', ${phaseId}, ${deptId}, ${sortOrder})
    `)
  }

  update(nodeId: string, fields: { title?: string; type?: string; detail?: string; phaseId?: number; deptId?: number }): void {
    const sets: string[] = []
    if (fields.title !== undefined) sets.push(`title = '${fields.title.replace(/'/g, "''")}'`)
    if (fields.type !== undefined) sets.push(`type = '${fields.type}'`)
    if (fields.detail !== undefined) sets.push(`detail = '${fields.detail.replace(/'/g, "''")}'`)
    if (fields.phaseId !== undefined) sets.push(`phase_id = ${fields.phaseId}`)
    if (fields.deptId !== undefined) sets.push(`dept_id = ${fields.deptId}`)
    if (sets.length === 0) return
    sets.push(`updated_at = datetime('now')`)
    dbManager.runSql(`UPDATE nodes SET ${sets.join(', ')} WHERE id = '${nodeId}'`)
  }

  delete(nodeId: string): void {
    // 级联删除连接
    dbManager.runSql(`DELETE FROM connections WHERE from_node = '${nodeId}' OR to_node = '${nodeId}'`)
    dbManager.runSql(`DELETE FROM nodes WHERE id = '${nodeId}'`)
  }

  updatePhase(nodeId: string, newPhaseId: number): void {
    dbManager.runSql(`
      UPDATE nodes SET phase_id = ${newPhaseId}, updated_at = datetime('now') WHERE id = '${nodeId}'
    `)
  }

  updateDept(nodeId: string, newDeptId: number): void {
    dbManager.runSql(`
      UPDATE nodes SET dept_id = ${newDeptId}, updated_at = datetime('now') WHERE id = '${nodeId}'
    `)
  }

  updateDetail(nodeId: string, detail: string): void {
    const escaped = detail.replace(/'/g, "''")
    dbManager.runSql(`
      UPDATE nodes SET detail = '${escaped}', updated_at = datetime('now') WHERE id = '${nodeId}'
    `)
  }

  updateSortOrder(phaseId: number, deptId: number, orders: { id: string; order: number }[]): void {
    const values = orders.map((o) => `('${o.id}', ${o.order})`).join(', ')
    dbManager.runSql(`
      UPDATE nodes SET sort_order = v.order
      FROM (VALUES ${values}) AS v(id, order)
      WHERE nodes.id = v.id AND nodes.phase_id = ${phaseId} AND nodes.dept_id = ${deptId}
    `)
  }

  getMaxSortOrder(phaseId: number, deptId: number): number {
    const result = dbManager.exec(`
      SELECT COALESCE(MAX(sort_order), 0) FROM nodes WHERE phase_id = ${phaseId} AND dept_id = ${deptId}
    `)
    return (result[0] && result[0].values && result[0].values[0] && result[0].values[0][0]) as number || 0
  }

  generateId(phaseId: number, deptId: number): string {
    const deptResult = dbManager.exec(`SELECT name FROM departments WHERE id = ${deptId}`)
    const deptName = (deptResult[0] && deptResult[0].values && deptResult[0].values[0] && deptResult[0].values[0][0] as string) || 'x'
    const deptCode = this.getPinyinFirst(deptName)
    const seq = this.getMaxSeqInPhaseDept(phaseId, deptId) + 1
    return `${deptCode}${phaseId}_${seq}`
  }

  private getMaxSeqInPhaseDept(phaseId: number, deptId: number): number {
    const result = dbManager.exec(`
      SELECT id FROM nodes WHERE phase_id = ${phaseId} AND dept_id = ${deptId}
    `)
    if (!result.length) return 0
    let max = 0
    for (const row of result[0].values) {
      const id = row[0] as string
      const match = id.match(/_(\d+)$/)
      if (match) max = Math.max(max, parseInt(match[1]))
    }
    return max
  }

  private getPinyinFirst(name: string): string {
    // 简单首字母映射（常见部门）
    const map: Record<string, string> = {
      '产品': 'p', '建筑': 'b', '景观': 'l', '内装方案团队': 'i', '方案单位': 'f',
      '施工图单位': 'd', '照明设计': 'ld', 'BIM': 'bim', '成本': 'c', '招采': 'pr',
      '技术部': 't', '工程': 'e', '开发': 'dev', '营销': 'mk', '法务': 'law',
      '物业': 'wy', '外装': 'wz', '软装': 's', '报建报审审图公司': 'a',
      '内装第三方审图': 'sp', '智能化': 'sm', '机电': 'm',
    }
    if (map[name]) return map[name]
    // fallback: 取首字母
    const first = name.charAt(0)
    const code = first.charCodeAt(0)
    if (code >= 0x4e00 && code <= 0x9fa5) {
      // 常见汉字首字母简单映射
      const pyMap: Record<string, string> = {
        '产': 'p', '建': 'b', '景': 'l', '内': 'i', '方': 'f', '施': 'd', '照': 'ld',
        '成': 'c', '招': 'pr', '技': 't', '工': 'e', '开': 'dev', '营': 'mk',
        '法': 'law', '物': 'wy', '外': 'wz', '软': 's', '报': 'a', '智': 'sm', '机': 'm',
      }
      return pyMap[first] || first.toLowerCase()
    }
    return first.toLowerCase()
  }
}
