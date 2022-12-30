import { getPrettyStatus, getStatusChoicesForTheirList } from './status';

describe('getPrettyStatus', () => {
  test("returns 'Unknown status' when not passed any arguments", () => {
    const value = getPrettyStatus();
    expect(value).toEqual('Unknown status');
  });
  test("returns 'Purchased' when not passed any arguments", () => {
    const value = getPrettyStatus(10);
    expect(value).toEqual('Purchased');
  });
  test("returns 'Unknown status' when not passed any arguments", () => {
    const value = getPrettyStatus(5);
    expect(value).toEqual('Reserved');
  });
});

describe('getStatusChoicesForTheirList', () => {
  const blank = {
    label: '',
    value: '',
  };
  const purchased = {
    label: 'Purchased',
    value: 10,
  };
  const reserved = {
    label: 'Reserved',
    value: 5,
  };
  const release = {
    label: 'Unpurchase/unreserve',
    value: 'XX',
  };
  const fullList = [blank, reserved, purchased, release];

  test('returns an empty array when not passed any arguments', () => {
    const value = getStatusChoicesForTheirList();
    expect(value).toEqual([]);
  });

  test('returns an empty array if status is zero and remove > 0', () => {
    const value = getStatusChoicesForTheirList(1234, {
      status: 0,
      remove: 1,
    });
    const expectation = [];
    expect(value).toEqual(expectation);
  });

  test('returns the full list of choices if status is zero and remove is 0', () => {
    const value = getStatusChoicesForTheirList(1234, {
      status: 0,
      remove: 0,
    });
    expect(value).toEqual(fullList);
  });

  test('returns the full list of choices if status is > 0 and the authenticated user is also the buyer.', () => {
    const value = getStatusChoicesForTheirList(1234, {
      status: 1,
      remove: 0,
      buy_userid: 1234,
    });
    expect(value).toEqual(fullList);
  });

  test('returns an empty array when status is > 0 and the authenticated user is not the buyer', () => {
    const value = getStatusChoicesForTheirList(1234, {
      status: 1,
      remove: 0,
      buy_userid: 4321,
    });
    expect(value).toEqual([]);
  });
});
