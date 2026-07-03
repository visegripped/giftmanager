import { NextRequest, NextResponse } from 'next/server';
import {
  isValidAccessToken,
  getFacebookProfile,
  type AuthProvider,
} from '@/lib/auth';
import * as handlers from '@/lib/handlers/items';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const access_token = String(formData.get('access_token') ?? '');
    const task = String(formData.get('task') ?? '');
    const auth_provider = String(
      formData.get('auth_provider') ?? 'google'
    ) as AuthProvider;
    const myuserid = String(formData.get('myuserid') ?? '');
    const theiruserid = String(formData.get('theiruserid') ?? '');
    const userid = String(formData.get('userid') ?? '');
    const itemid = String(formData.get('itemid') ?? '');
    const noteid = String(formData.get('noteid') ?? '');
    const name = String(formData.get('name') ?? '');
    const avatar = String(formData.get('avatar') ?? '');
    const description = String(formData.get('description') ?? '');
    const link = String(formData.get('link') ?? '');
    const date_received = String(formData.get('date_received') ?? '');
    const removed = String(formData.get('removed') ?? '');
    const status = String(formData.get('status') ?? '');
    const groupid = String(formData.get('groupid') ?? '1');
    const email_address = String(formData.get('email_address') ?? '');
    const note = String(formData.get('note') ?? '');

    let apiResponse: Record<string, unknown> = {
      warn: 'successful post with no task passed.',
    };

    if (task === 'getFacebookProfile') {
      if (!access_token) {
        apiResponse = {
          error: 'Access token not specified for getFacebookProfile task.',
        };
      } else {
        apiResponse = await getFacebookProfile(access_token);
      }
    } else {
      const valid = await isValidAccessToken(access_token, auth_provider);
      if (!valid) {
        apiResponse = {
          error: 'Invalid/expired token.  Please sign (or re-sign) in.',
        };
        return jsonResponse(apiResponse);
      }

      if (task === 'addItemToMyList' && myuserid && name && groupid) {
        apiResponse = await handlers.addItemToMyList(
          myuserid,
          name,
          description,
          link,
          groupid
        );
      } else if (task === 'getMyItemList' && myuserid) {
        apiResponse = await handlers.getMyItemList(myuserid);
      } else if (task === 'getMyReservedPurchasedItems' && myuserid) {
        apiResponse = await handlers.getMyReservedPurchasedItems(myuserid);
      } else if (
        task === 'updateItemOnMyList' &&
        myuserid &&
        itemid &&
        (description || link)
      ) {
        apiResponse = await handlers.updateItemOnMyList(
          myuserid,
          Number(itemid),
          description,
          link
        );
      } else if (
        task === 'updateRemovedStatusForMyItem' &&
        myuserid &&
        removed !== '' &&
        itemid
      ) {
        apiResponse = await handlers.updateRemovedStatusForMyItem(
          myuserid,
          removed,
          Number(itemid)
        );
      } else if (
        task === 'addItemToTheirList' &&
        theiruserid &&
        myuserid &&
        name
      ) {
        apiResponse = await handlers.addItemToTheirList(
          myuserid,
          theiruserid,
          name,
          description,
          link,
          groupid
        );
      } else if (task === 'getTheirItemList' && theiruserid) {
        apiResponse = await handlers.getTheirItemList(theiruserid);
      } else if (
        task === 'updateStatusForTheirItem' &&
        theiruserid &&
        status &&
        myuserid &&
        itemid
      ) {
        apiResponse = await handlers.updateStatusForTheirItem(
          myuserid,
          theiruserid,
          Number(itemid),
          status,
          date_received || null
        );
      } else if (task === 'getItemNotes' && myuserid && itemid) {
        apiResponse = await handlers.getItemNotes(myuserid, Number(itemid));
      } else if (
        task === 'createItemNote' &&
        myuserid &&
        itemid &&
        note !== ''
      ) {
        apiResponse = await handlers.createItemNote(
          myuserid,
          Number(itemid),
          note
        );
      } else if (
        task === 'updateItemNote' &&
        myuserid &&
        noteid &&
        note !== ''
      ) {
        apiResponse = await handlers.updateItemNote(
          myuserid,
          Number(noteid),
          note
        );
      } else if (task === 'deleteItemNote' && myuserid && noteid) {
        apiResponse = await handlers.deleteItemNote(myuserid, Number(noteid));
      } else if (task === 'getUserProfileByUserId' && userid) {
        apiResponse = await handlers.getUserProfileByUserId(userid);
      } else if (task === 'getUsersList') {
        apiResponse = await handlers.getUsersList();
      } else if (task === 'updateAvatar' && email_address && avatar) {
        apiResponse = await handlers.updateAvatar(email_address, avatar);
      } else if (task === 'confirmUserIsValid' && email_address) {
        apiResponse = await handlers.confirmUserIsValid(email_address);
      } else if (task === 'archivePurchasedItems' && myuserid === '1') {
        apiResponse = await handlers.archivePurchasedItems();
      } else if (task === 'archiveRemovedItems' && myuserid === '1') {
        apiResponse = await handlers.archiveRemovedItems();
      } else if (task) {
        apiResponse = {
          error: `Invalid task (${task}) or myuserid (${myuserid}) or missing params`,
        };
      }
    }

    return jsonResponse(apiResponse);
  } catch (error) {
    console.error('API error:', error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      500
    );
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Auth-Provider',
  };
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(),
  });
}
