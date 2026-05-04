import client from '@/api/client.js';
import type { Connection, ConnectionFull } from '@/types';

export class ConnectionDao {
  async getAll(): Promise<Connection[]> {
    const { data } = await client.get('/connections');
    return data;
  }

  async create(fromNode: string, toNode: string, type: string, description: string): Promise<void> {
    await client.post('/connections', { fromNode, toNode, type, description });
  }

  async deleteById(id: number): Promise<void> {
    await client.delete(`/connections/${id}`);
  }

  async deleteByNodes(fromNode: string, toNode: string): Promise<void> {
    // Find then delete by ID
    const all = await this.getAll();
    const found = all.find((c) => c.fromNode === fromNode && c.toNode === toNode);
    if (found) await this.deleteById(found.id);
  }

  async update(id: number, type: string, description: string): Promise<void> {
    await client.put(`/connections/${id}`, { type, description });
  }

  async getByNode(nodeId: string): Promise<{ upstream: ConnectionFull[]; downstream: ConnectionFull[] }> {
    const { data } = await client.get(`/connections/node/${nodeId}`);
    return data;
  }
}
