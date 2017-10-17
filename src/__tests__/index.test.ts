import downloadAsStream from '../';

(jest as any).setTimeout(60000);

test('download as stream', async () => {
  const messages = await downloadAsStream(
    'https://mail.mozilla.org/pipermail/es-discuss/',
    {
      filterMonth(url) {
        return (
          url ===
            'https://mail.mozilla.org/pipermail/es-discuss/2007-November' ||
          url === 'https://mail.mozilla.org/pipermail/es-discuss/2007-December'
        );
      },
      parallel: 40,
    },
  ).buffer();
  expect(messages).toMatchSnapshot();
});
