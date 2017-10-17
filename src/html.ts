import {Parser} from 'htmlparser2';
import {decode} from 'ent';

// no types are included for this export
const {DomHandler} = require('htmlparser2');

const selfClosing = [
  'meta',
  'img',
  'link',
  'input',
  'source',
  'area',
  'base',
  'col',
  'br',
  'hr',
];

export enum DomNodeType {
  tag = 'tag',
  text = 'text',
}
export interface DomNodeBase {
  type: DomNodeType;
}
export interface DomNodeTag extends DomNodeBase {
  type: DomNodeType.tag;
  name: string;
  children: DomNode[];
  attribs: {[key: string]: string | void};
}
export interface DomNodeText extends DomNodeBase {
  type: DomNodeType.text;
  data: string;
}
export type DomNode = DomNodeTag | DomNodeText;

export default function parseHTML(src: string) {
  var handler = new DomHandler();
  var p = new Parser(handler);
  p.parseComplete(src);
  function fix(dom: DomNode | DomNode[]): DomNode[] {
    if (Array.isArray(dom)) {
      return dom.map(fix).reduce(function(a, b) {
        return a.concat(b);
      }, []);
    } else if (dom.type != 'tag') {
      return [dom];
    } else if (selfClosing.indexOf(dom.name.toLowerCase()) === -1) {
      if (dom.children) dom.children = fix(dom.children);
      else dom.children = [];
      return [dom];
    } else {
      var c = dom.children;
      dom.children = [];
      return [dom as DomNode].concat(fix(c || []));
    }
  }
  return new DOM(fix(handler.dom));
}

function textContent(dom: DomNode[] | DomNode): string {
  if (Array.isArray(dom)) return dom.map(textContent).join('');
  else if (dom.type === 'text') return decode(dom.data);
  else if (dom.type === 'tag') return textContent(dom.children);
  else return '';
}

export class DOM {
  dom: DomNode[];
  constructor(dom: DomNode[]) {
    this.dom = dom;
  }
  textContent(): string {
    return textContent(this.dom);
  }
  attr(name: string): string | null {
    const dom = this.dom[0];
    if (dom.type === 'tag') {
      var keys = Object.keys(dom.attribs);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].toLowerCase() === name) {
          const value = dom.attribs[keys[i]];
          return value ? decode(value) : null;
        }
      }
    }
    return null;
  }
  first(): DOM {
    return new DOM(this.dom.length ? [this.dom[0]] : []);
  }
  select(path: string[]): DOM {
    return new DOM(tagPath(this.dom, path.slice()));
  }
}

function tagPath(dom: DomNode[], path: string[]): DomNode[] {
  const tag = path.shift();
  const matchingTags: DomNodeTag[] = dom.filter((c): c is DomNodeTag => {
    return c.type === DomNodeType.tag && c.name.toLowerCase() === tag;
  });
  if (path.length === 0) return matchingTags;
  else
    return matchingTags
      .map(node => tagPath(node.children, path))
      .reduce(function(a, b) {
        return a.concat(b);
      }, []);
}
