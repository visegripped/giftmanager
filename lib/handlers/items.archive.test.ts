import { describe, it, expect, vi, beforeEach } from 'vitest';
import { and, eq, or, sql } from 'drizzle-orm';
import { items } from '../db/schema';

const mockWhere = vi.fn().mockResolvedValue(undefined);
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

vi.mock('../db', () => ({
  getDb: () => ({
    update: mockUpdate,
  }),
}));

import { runScheduledArchive } from './items';

describe('runScheduledArchive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs four archive passes without touching non-purchased wish-list items', async () => {
    await runScheduledArchive();

    expect(mockUpdate).toHaveBeenCalledTimes(4);
    expect(mockUpdate).toHaveBeenCalledWith(items);

    const firstWhere = mockWhere.mock.calls[0][0];
    expect(firstWhere).toEqual(
      and(
        eq(items.archive, 0),
        eq(items.status, 'purchased'),
        or(
          sql`${items.dateReceived} IS NULL`,
          sql`TRIM(COALESCE(${items.dateReceived}, '')) = ''`
        )
      )
    );

    const secondWhere = mockWhere.mock.calls[1][0];
    expect(secondWhere).toEqual(
      and(
        eq(items.archive, 0),
        eq(items.status, 'purchased'),
        sql`${items.dateReceived} IS NOT NULL`,
        sql`TRIM(${items.dateReceived}) != ''`,
        sql`${items.dateReceived} < ${new Date().toISOString().slice(0, 10)}`
      )
    );
  });
});
