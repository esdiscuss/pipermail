import readIndex from '../read-index';

test('parses the index to return an array of month urls', async () => {
  const res = await readIndex('https://mail.mozilla.org/pipermail/es-discuss/');
  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(70);
  res.forEach(url => {
    expect(url).toMatch(
      /^https:\/\/mail.mozilla.org\/pipermail\/es-discuss\/\d\d\d\d\-[A-Z][a-z]+$/,
    );
  });
  // by only looking at the oldest months, they should rarely change
  expect(res.slice(0, 70)).toMatchSnapshot();
});
