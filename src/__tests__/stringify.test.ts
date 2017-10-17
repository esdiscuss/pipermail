import stringify from '../stringify';

test('stiringify', async () => {
  const strm = stringify();
  strm.write({foo: 10});
  strm.write({bar: 42});
  strm.write({baz: 32});
  strm.end();
  expect(await strm.buffer('utf8')).toMatchSnapshot();
});
