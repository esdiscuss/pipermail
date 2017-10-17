import request from 'then-request';
import Promise = require('promise');

export default function readMonth(url: string): Promise<string[]> {
  url = url.replace(/\/$/, '').replace(/\/date\.html$/, '');
  return request('GET', url + '/date.html', {
    retry: true,
    retryDelay: (err, res, attemptNo) => 500 * Math.pow(2, attemptNo),
  })
    .getBody('utf8')
    .then(body => {
      const urls = new Set<string>();
      const pattern = /href=\"(\d+\.html)\"/gi;
      let match;
      while ((match = pattern.exec(body))) {
        urls.add(url + '/' + match[1]);
      }
      return Array.from(urls);
    });
}
