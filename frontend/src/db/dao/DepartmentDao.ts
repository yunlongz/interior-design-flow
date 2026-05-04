import client from '@/api/client.js';
import type { Department } from '@/types';

export class DepartmentDao {
  async getAll(): Promise<Department[]> {
    const { data } = await client.get('/departments');
    return data;
  }

  async getById(id: number): Promise<Department | null> {
    try {
      const { data } = await client.get(`/departments/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async create(name: string, sortOrder: number): Promise<number> {
    const { data } = await client.post('/departments', { name, sortOrder });
    return data.id;
  }

  async update(id: number, name: string, sortOrder: number): Promise<void> {
    await client.put(`/departments/${id}`, { name, sortOrder });
  }

  async delete(id: number): Promise<void> {
    await client.delete(`/departments/${id}`);
  }

  async getNodeCount(id: number): Promise<number> {
    const { data } = await client.get(`/departments/${id}/node-count`);
    return data.count;
  }
}
