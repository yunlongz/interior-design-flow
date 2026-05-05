export type NodeType = 'task' | 'review' | 'deliverable' | 'decision' | 'milestone'

export interface Phase {
  id: number
  name: string
  sortOrder: number
}

export interface Department {
  id: number
  name: string
  sortOrder: number
}

export interface FlowNode {
  id: string
  title: string
  type: NodeType
  detail: string
  phaseId: number
  deptId: number
  sortOrder: number
  isHighlighted: boolean
}

export interface FlowNodeFull extends FlowNode {
  phaseName: string
  deptName: string
}

export interface Connection {
  id: number
  fromNode: string
  toNode: string
  type: string
  description: string
}

export interface ConnectionFull extends Connection {
  fromTitle?: string
  fromDept?: string
  toTitle?: string
  toDept?: string
}

export interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'warn' | 'info'
}
