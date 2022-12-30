import userListToSelectList from './userListToSelectList';
import sampleUserList from '../test/response-usersGet.json';

describe('userListToSelectList', () => {
  test('returns an empty array when not passed an argument', () => {
    const value = userListToSelectList();
    expect(value).toEqual([]);
  });

  test('returns an array with properly formatted content', () => {
    const value = userListToSelectList(sampleUserList.users);
    const expectation = [
      { value: 1, label: 'Han Solo' },
      { value: 2, label: 'Luke Skywalker' },
      { value: 3, label: 'Leia Organa' },
    ];
    expect(value).toEqual(expectation);
  });
});
