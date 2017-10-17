import request from 'then-request';
import Promise = require('promise');
import html from './html';

export interface Header {
  subject: string;
  from: {
    name: string;
    email: string;
  };
  reply: string;
  date: Date;
}
export interface Message {
  url: string;
  header: Header;
  body: string;
}
export default function readMessage(url: string): Promise<Message> {
  return request('GET', url, {
    retry: true,
    retryDelay: (err, res, attemptNo) => 500 * Math.pow(2, attemptNo),
  })
    .getBody('utf8')
    .then(function(body) {
      try {
        const dom = html(body);

        const header = {
          subject: dom
            .select(['html', 'body', 'h1'])
            .first()
            .textContent()
            .trim(),
          from: {
            name: dom
              .select(['html', 'body', 'b'])
              .first()
              .textContent()
              .trim(),
            email: dom
              .select(['html', 'body', 'a'])
              .first()
              .textContent()
              .trim()
              .replace(' at ', '@'),
          },
          reply:
            dom
              .select(['html', 'body', 'a'])
              .first()
              .attr('href') || '',
          date: new Date(
            dom
              .select(['html', 'body', 'i'])
              .first()
              .textContent()
              .trim(),
          ),
        };

        return {
          url: url,
          header: header,
          body: dom
            .select(['html', 'body', 'p', 'pre'])
            .first()
            .textContent()
            .trim(),
        };
      } catch (ex) {
        ex.message += '\n\n\n' + body;
        throw ex;
      }
    });
}
