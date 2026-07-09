import { eq, and, sql, asc, or, ne, inArray } from 'drizzle-orm';
import { getDb } from '../db';
import { items, itemNotes, users } from '../db/schema';

export type ApiResponse =
  | { success: string | Record<string, unknown>[] }
  | { error: string }
  | { warn: string };

export async function addItemToMyList(
  userid: string,
  name: string,
  description: string,
  link: string,
  groupid: string
): Promise<ApiResponse> {
  const db = getDb();
  await db.insert(items).values({
    userid: Number(userid),
    name,
    description: description || '',
    link: link || '',
    addedByUserid: Number(userid),
    groupid: Number(groupid),
  });
  return { success: `Item added to user ${userid}` };
}

export async function getMyItemList(userid: string): Promise<ApiResponse> {
  const db = getDb();
  const rows = await db
    .select()
    .from(items)
    .where(
      and(
        eq(items.userid, Number(userid)),
        eq(items.addedByUserid, Number(userid)),
        eq(items.archive, 0)
      )
    )
    .orderBy(asc(items.dateAdded));

  if (rows.length === 0) {
    return { warn: 'No items found for the specified user.' };
  }
  return { success: rows.map(mapItemRow) };
}

export async function getMyReservedPurchasedItems(
  myuserid: string
): Promise<ApiResponse> {
  const db = getDb();
  const rows = await db
    .select({
      item: items,
      ownerName: sql<string>`CONCAT(${users.firstname}, ' ', ${users.lastname})`,
      ownerAvatar: users.avatar,
    })
    .from(items)
    .leftJoin(users, eq(items.userid, users.userid))
    .where(
      and(
        eq(items.statusUserid, Number(myuserid)),
        inArray(items.status, ['purchased', 'reserved']),
        eq(items.archive, 0)
      )
    )
    .orderBy(asc(items.dateAdded));

  if (rows.length === 0) {
    return { warn: 'No items found for the specified user.' };
  }
  return {
    success: rows.map((r) => ({
      ...mapItemRow(r.item),
      owner_name: r.ownerName,
      owner_avatar: r.ownerAvatar,
    })),
  };
}

async function verifyViewerIsNotOwner(
  myuserid: string,
  itemid: number
): Promise<ApiResponse | null> {
  const db = getDb();
  const [item] = await db
    .select({ userid: items.userid })
    .from(items)
    .where(eq(items.itemid, itemid))
    .limit(1);

  if (!item) {
    return { error: 'Item not found' };
  }
  if (String(item.userid) === String(myuserid)) {
    return { error: 'Item notes are not available on your own list' };
  }
  return null;
}

export async function getItemNotes(
  myuserid: string,
  itemid: number
): Promise<ApiResponse> {
  const check = await verifyViewerIsNotOwner(myuserid, itemid);
  if (check) return check;

  const db = getDb();
  const rows = await db
    .select({
      noteid: itemNotes.noteid,
      itemid: itemNotes.itemid,
      userid: itemNotes.userid,
      note: itemNotes.note,
      created_at: itemNotes.createdAt,
      updated_at: itemNotes.updatedAt,
      author_name: sql<string>`CONCAT(${users.firstname}, ' ', ${users.lastname})`,
      author_avatar: users.avatar,
    })
    .from(itemNotes)
    .leftJoin(users, eq(itemNotes.userid, users.userid))
    .where(eq(itemNotes.itemid, itemid))
    .orderBy(asc(itemNotes.createdAt));

  return { success: rows };
}

export async function createItemNote(
  myuserid: string,
  itemid: number,
  note: string
): Promise<ApiResponse> {
  const trimmed = note.trim();
  if (!trimmed) return { error: 'Note cannot be empty' };

  const check = await verifyViewerIsNotOwner(myuserid, itemid);
  if (check) return check;

  const db = getDb();
  await db.insert(itemNotes).values({
    itemid,
    userid: Number(myuserid),
    note: trimmed,
  });
  return { success: 'Note created' };
}

export async function updateItemNote(
  myuserid: string,
  noteid: number,
  note: string
): Promise<ApiResponse> {
  const trimmed = note.trim();
  if (!trimmed) return { error: 'Note cannot be empty' };

  const db = getDb();
  const [row] = await db
    .select({
      userid: itemNotes.userid,
      ownerUserid: items.userid,
    })
    .from(itemNotes)
    .leftJoin(items, eq(itemNotes.itemid, items.itemid))
    .where(eq(itemNotes.noteid, noteid))
    .limit(1);

  if (!row) return { error: 'Note not found' };
  if (String(row.userid) !== String(myuserid)) {
    return { error: 'You can only edit your own notes' };
  }
  if (String(row.ownerUserid) === String(myuserid)) {
    return { error: 'Item notes are not available on your own list' };
  }

  await db
    .update(itemNotes)
    .set({ note: trimmed, updatedAt: new Date() })
    .where(
      and(eq(itemNotes.noteid, noteid), eq(itemNotes.userid, Number(myuserid)))
    );
  return { success: 'Note updated' };
}

export async function deleteItemNote(
  myuserid: string,
  noteid: number
): Promise<ApiResponse> {
  const db = getDb();
  const [row] = await db
    .select({
      userid: itemNotes.userid,
      ownerUserid: items.userid,
    })
    .from(itemNotes)
    .leftJoin(items, eq(itemNotes.itemid, items.itemid))
    .where(eq(itemNotes.noteid, noteid))
    .limit(1);

  if (!row) return { error: 'Note not found' };
  if (String(row.userid) !== String(myuserid)) {
    return { error: 'You can only delete your own notes' };
  }
  if (String(row.ownerUserid) === String(myuserid)) {
    return { error: 'Item notes are not available on your own list' };
  }

  await db
    .delete(itemNotes)
    .where(
      and(eq(itemNotes.noteid, noteid), eq(itemNotes.userid, Number(myuserid)))
    );
  return { success: 'Note deleted' };
}

export async function updateItemOnMyList(
  userid: string,
  itemid: number,
  description: string,
  link: string
): Promise<ApiResponse> {
  const updates: Partial<typeof items.$inferInsert> = {};
  if (description) updates.description = description;
  if (link) updates.link = link;
  if (Object.keys(updates).length === 0) {
    return { error: 'No fields to update' };
  }

  const db = getDb();
  await db
    .update(items)
    .set(updates)
    .where(and(eq(items.userid, Number(userid)), eq(items.itemid, itemid)));

  return { success: 'Item updated' };
}

export async function updateRemovedStatusForMyItem(
  userid: string,
  removed: string,
  itemid: number
): Promise<ApiResponse> {
  const db = getDb();
  await db
    .update(items)
    .set({ removed: Number(removed) })
    .where(and(eq(items.itemid, itemid), eq(items.userid, Number(userid))));

  return { success: `item ${itemid} updated` };
}

export async function addItemToTheirList(
  myuserid: string,
  theiruserid: string,
  name: string,
  description: string,
  link: string,
  groupid: string
): Promise<ApiResponse> {
  const db = getDb();
  await db.insert(items).values({
    userid: Number(theiruserid),
    name,
    description: description || '',
    link: link || '',
    addedByUserid: Number(myuserid),
    statusUserid: Number(myuserid),
    groupid: Number(groupid),
    status: 'purchased',
  });
  return { success: `Item added for user ${theiruserid}` };
}

export async function getTheirItemList(userid: string): Promise<ApiResponse> {
  const db = getDb();
  const rows = await db
    .select({
      item: items,
      notesCount: sql<number>`(SELECT COUNT(*)::int FROM item_notes n WHERE n.itemid = ${items.itemid})`,
      statusUsername: sql<string>`CONCAT(${users.firstname}, ' ', ${users.lastname})`,
    })
    .from(items)
    .leftJoin(users, eq(items.statusUserid, users.userid))
    .where(
      and(
        eq(items.userid, Number(userid)),
        eq(items.archive, 0),
        or(
          eq(items.removed, 0),
          and(eq(items.removed, 1), ne(items.status, 'no change'))
        )
      )
    )
    .orderBy(asc(items.dateAdded));

  if (rows.length === 0) {
    return { warn: 'No items found for the specified user.' };
  }
  return {
    success: rows.map((r) => ({
      ...mapItemRow(r.item),
      notes_count: r.notesCount,
      status_username: r.statusUsername,
    })),
  };
}

export async function updateStatusForTheirItem(
  myuserid: string,
  theiruserid: string,
  itemid: number,
  status: string,
  dateReceived?: string | null
): Promise<ApiResponse> {
  if (status === 'purchased' && !dateReceived) {
    return { error: "date_received is required when status is 'purchased'" };
  }

  const db = getDb();
  const updates: Partial<typeof items.$inferInsert> = {
    status,
    statusUserid: Number(myuserid),
  };
  if (status === 'purchased' && dateReceived) {
    updates.dateReceived = dateReceived;
  }

  await db
    .update(items)
    .set(updates)
    .where(
      and(eq(items.itemid, itemid), eq(items.userid, Number(theiruserid)))
    );

  return { success: `item ${itemid} updated` };
}

export async function getUserProfileByUserId(
  userid: string
): Promise<ApiResponse> {
  const db = getDb();
  const rows = await db
    .select({
      userid: users.userid,
      firstname: users.firstname,
      lastname: users.lastname,
      groupid: users.groupid,
      created: users.created,
      email: users.email,
      avatar: users.avatar,
      birthday_month: users.birthdayMonth,
      birthday_day: users.birthdayDay,
    })
    .from(users)
    .where(eq(users.userid, Number(userid)));

  if (rows.length === 0) {
    return { warn: `No user found for userid: ${userid}.` };
  }
  return { success: rows };
}

export async function confirmUserIsValid(email: string): Promise<ApiResponse> {
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.groupid, 1)));

  if (rows.length === 0) {
    return { error: `No user found for ${email}` };
  }
  return { success: rows };
}

export async function getUsersList(): Promise<ApiResponse> {
  const db = getDb();
  const rows = await db.select().from(users).orderBy(asc(users.firstname));
  if (rows.length === 0) {
    return { warn: 'No items found for the specified user.' };
  }
  return { success: rows };
}

export async function updateAvatar(
  emailAddress: string,
  avatar: string
): Promise<ApiResponse> {
  const db = getDb();
  await db.update(users).set({ avatar }).where(eq(users.email, emailAddress));

  return { success: 'Avatar has been updated' };
}

export async function archivePurchasedItems(): Promise<ApiResponse> {
  const db = getDb();
  await db
    .update(items)
    .set({ archive: 1 })
    .where(and(eq(items.status, 'purchased'), eq(items.archive, 0)));

  return { success: 'Purchased items have been archived.' };
}

export async function archiveRemovedItems(): Promise<ApiResponse> {
  const db = getDb();
  await db
    .update(items)
    .set({ archive: 1 })
    .where(and(eq(items.removed, 1), eq(items.archive, 0)));

  return { success: 'Removed items have been archived.' };
}

export async function runScheduledArchive(): Promise<{
  results: Record<string, number>;
}> {
  const db = getDb();
  const currentDate = new Date().toISOString().slice(0, 10);
  const results: Record<string, number> = {};

  // Archive purchased items with no/invalid date_received (wish-list items have no date)
  await db
    .update(items)
    .set({ archive: 1 })
    .where(
      and(
        eq(items.archive, 0),
        eq(items.status, 'purchased'),
        or(
          sql`${items.dateReceived} IS NULL`,
          sql`TRIM(COALESCE(${items.dateReceived}, '')) = ''`
        )
      )
    );

  // Archive purchased items past delivery date
  await db
    .update(items)
    .set({ archive: 1 })
    .where(
      and(
        eq(items.archive, 0),
        eq(items.status, 'purchased'),
        sql`${items.dateReceived} IS NOT NULL`,
        sql`TRIM(${items.dateReceived}) != ''`,
        sql`${items.dateReceived} < ${currentDate}`
      )
    );

  // Archive removed items not reserved/purchased
  await db
    .update(items)
    .set({ archive: 1 })
    .where(
      and(
        eq(items.removed, 1),
        eq(items.archive, 0),
        sql`${items.status} NOT IN ('reserved', 'purchased')`
      )
    );

  // Archive removed purchased items past date
  await db
    .update(items)
    .set({ archive: 1 })
    .where(
      and(
        eq(items.removed, 1),
        eq(items.status, 'purchased'),
        eq(items.archive, 0),
        sql`${items.dateReceived} IS NOT NULL`,
        sql`TRIM(${items.dateReceived}) != ''`,
        sql`${items.dateReceived} < ${currentDate}`
      )
    );

  return { results };
}

function mapItemRow(row: typeof items.$inferSelect) {
  return {
    itemid: row.itemid,
    userid: row.userid,
    name: row.name,
    description: row.description,
    link: row.link,
    added_by_userid: row.addedByUserid,
    status_userid: row.statusUserid,
    groupid: row.groupid,
    status: row.status,
    removed: row.removed,
    archive: row.archive,
    date_added: row.dateAdded,
    date_received: row.dateReceived,
  };
}
