import readMonth from '../read-month';

test('parses a month listing page to return an array of message urls', async () => {
  const res = await readMonth(
    'https://mail.mozilla.org/pipermail/es-discuss/2011-December',
  );
  expect(Array.isArray(res)).toBeTruthy();
  expect(res.length).toBeGreaterThan(10);
  res.forEach(url => {
    expect(url).toMatch(
      /^https:\/\/mail.mozilla.org\/pipermail\/es-discuss\/2011-December\/\d\d\d\d\d\d\.html$/,
    );
  });
  expect(res).toMatchSnapshot();
});
