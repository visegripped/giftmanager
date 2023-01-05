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
