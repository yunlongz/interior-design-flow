import client from '@/api/client.js';
import type { Phase } from '@/types';

export class PhaseDao {
  async getAll(): Promise<Phase[]> {
    const { data } = await client.get('/phases');
    return data;
  }

  async getById(id: number): Promise<Phase | null> {
    try {
      const { data } = await client.get(`/phases/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async create(name: string, sortOrder: number): Promise<number> {
    const { data } = await client.post('/phases', { name, sortOrder });
    return data.id;
  }

  async update(id: number, name: string, sortOrder: number): Promise<void> {
    await client.put(`/phases/${id}`, { name, sortOrder });
  }

  async delete(id: number): Promise<void> {
    await client.delete(`/phases/${id}`);
  }

  async getNodeCount(id: number): Promise<number> {
    const { data } = await client.get(`/phases/${id}/node-count`);
    return data.count;
  }
}
