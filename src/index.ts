import {Readable, ReadableStream} from 'barrage';
import Promise = require('promise');
import readIndex from './read-index';
import readMonth from './read-month';
import readMessage, {Message, Header} from './read-message';
import stringify from './stringify';

function toStream<T>(p: PromiseLike<T[]>): Readable<T> {
  let hasRead = false;
  return new Readable({
    objectMode: true,
    read(size, push) {
      if (hasRead) {
        return;
      }
      hasRead = true;
      p.then(
        a => {
          a.forEach(v => push(v));
          push(null);
        },
        err => {
          this.emit('error', err);
        },
      );
    },
  });
}

export interface Options {
  archiveUrlRegex?: RegExp;
  filterMonth?: (month: string) => boolean | PromiseLike<boolean>;
  filterMessage?: (month: string) => boolean | PromiseLike<boolean>;
  months?: number;
  parallelMonths?: number;
  parallel?: number;
}
export {readIndex, readMonth, readMessage, stringify};
export {Message, Header, ReadableStream};

export default function download(
  src: string,
  options: Options = {},
): ReadableStream<Message> {
  const filterMonth = options.filterMonth || TRUE;
  const filterMessage = options.filterMessage || TRUE;

  const months = readIndex(src, options).then(function(months) {
    if (options.months && options.months !== Infinity) {
      return months.slice(Math.max(months.length - options.months, 0));
    } else {
      return months;
    }
  });

  return toStream(months)
    .filter(filterMonth)
    .flatMap(month => readMonth(month), {parallel: options.parallelMonths || 2})
    .filter(filterMessage)
    .map(url => readMessage(url), {parallel: options.parallel || 10});
}

function TRUE() {
  return true;
}

module.exports = download;
module.exports.default = download;
module.exports.readIndex = readIndex;
module.exports.readMonth = readMonth;
module.exports.readMessage = readMessage;
module.exports.stringify = stringify;
