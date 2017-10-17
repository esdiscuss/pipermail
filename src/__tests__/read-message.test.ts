import readMessage from '../read-message';

function testMessage(url: string) {
  test(url, async () => {
    const message = await readMessage(url);
    expect(message).toMatchSnapshot();
  });
}
testMessage(
  'https://mail.mozilla.org/pipermail/es-discuss/2013-April/029615.html',
);
testMessage(
  // a message with no body
  'https://mail.mozilla.org/pipermail/es-discuss/2008-October/007920.html',
);
