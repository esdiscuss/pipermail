import request from 'then-request';
import Promise = require('promise');

export interface Options {
  archiveUrlRegex?: RegExp;
}
export default function readIndex(
  url: string,
  options: Options = {},
): Promise<string[]> {
  url = url.replace(/\/$/, '');
  return request('GET', url, {
    retry: true,
    retryDelay: (err, res, attemptNo) => 500 * Math.pow(2, attemptNo),
  })
    .getBody('utf8')
    .then(body => {
      const pattern =
        options.archiveUrlRegex || /\d\d\d\d\-[a-z]+\.txt(?:\.gz)?/gi;
      let match;
      const urls = [];
      while ((match = pattern.exec(body))) {
        urls.push(url + '/' + match[0].replace(/\.txt(?:\.gz)?/, ''));
      }
      return urls.reverse();
    });
}
