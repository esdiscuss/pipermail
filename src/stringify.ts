import {Transform} from 'barrage';

export default function stringify(): Transform<any, string> {
  let first = true;
  return new Transform({
    writableObjectMode: true,
    transform(item, _, push, cb) {
      push((first ? '' : '\n') + JSON.stringify(item));
      first = false;
      cb();
    },
  });
}
