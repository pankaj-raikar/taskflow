import { describe, expect, test } from 'bun:test';
import { ApiClient } from './api';

describe('ApiClient', () => {
  test('sends the bearer token and task payloads to the backend', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const client = new ApiClient('http://localhost:3000/api', 'token-123', async (url, init) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response(
        JSON.stringify({
          data: {
            id: 'task-1',
            title: 'Wire frontend to backend',
            description: 'Use Hono API',
            status: 'todo',
            category: 'Development',
            priority: 'high',
            dueDate: '2026-05-28',
            dateLabel: 'Due Today',
            assigneeId: 'user-1',
            starred: false
          }
        }),
        { status: 201, headers: { 'content-type': 'application/json' } }
      );
    });

    const task = await client.createTask({
      title: 'Wire frontend to backend',
      description: 'Use Hono API',
      status: 'todo',
      category: 'Development',
      priority: 'high',
      dueDate: '2026-05-28',
      assigneeId: 'user-1',
      starred: false
    });

    expect(task.id).toBe('task-1');
    expect(calls[0]?.url).toBe('http://localhost:3000/api/tasks');
    expect(calls[0]?.init.method).toBe('POST');
    expect((calls[0]?.init.headers as Record<string, string>).Authorization).toBe('Bearer token-123');
    expect(JSON.parse(String(calls[0]?.init.body))).toMatchObject({
      title: 'Wire frontend to backend',
      assigneeId: 'user-1'
    });
  });

  test('sends custom task categories to the backend unchanged', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const client = new ApiClient('http://localhost:3000/api', 'token-123', async (url, init) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response(
        JSON.stringify({
          data: {
            id: 'task-2',
            title: 'Plan QA batch',
            description: 'Coordinate light-mode fixes.',
            status: 'in-progress',
            category: 'QA Batch',
            priority: 'medium',
            dueDate: '2026-05-29',
            dateLabel: 'Due Tomorrow',
            assigneeId: 'user-1',
            starred: false
          }
        }),
        { status: 201, headers: { 'content-type': 'application/json' } }
      );
    });

    const task = await client.createTask({
      title: 'Plan QA batch',
      description: 'Coordinate light-mode fixes.',
      status: 'in-progress',
      category: 'QA Batch',
      priority: 'medium',
      dueDate: '2026-05-29',
      assigneeId: 'user-1',
      starred: false
    });

    expect(task.category).toBe('QA Batch');
    expect(JSON.parse(String(calls[0]?.init.body)).category).toBe('QA Batch');
  });
});
