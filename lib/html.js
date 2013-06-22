var parser = require('htmlparser2')
var decode = require('ent').decode

var selfClosing = ['meta', 'img', 'link', 'input', 'source', 'area', 'base', 'col', 'br', 'hr']

module.exports = parseHTML
function parseHTML(src) {
  var handler = new parser.DomHandler()
  var p = new parser.Parser(handler)
  p.parseComplete(src)
  function fix(dom) {
    if (Array.isArray(dom)) {
      return dom.map(fix).reduce(function (a, b) { return a.concat(b) }, [])
    } else if (dom.type != 'tag') {
      return [dom]
    } else if (selfClosing.indexOf(dom.name.toLowerCase()) === -1) {
      if (dom.children) dom.children = fix(dom.children)
      return [dom]
    } else {
      var c = dom.children
      dom.children = []
      return [dom].concat(fix(c))
    }
  }
  return new DOM(fix(handler.dom))
}

function DOM(dom) {
  this.dom = dom
}
DOM.prototype.textContent = function () {
  return textContent(this.dom)
}
function textContent(dom) {
  if (Array.isArray(dom)) return dom.map(textContent).join('')
  else if (dom.type === 'text') return decode(dom.data)
  else if (dom.type === 'tag') return textContent(dom.children)
  else return ''
}
DOM.prototype.attr = function attr(name) {
  var dom = this.dom[0]
  if (dom.type === 'tag') {
    var keys = Object.keys(dom.attribs)
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === name) {
        return decode(dom.attribs[keys[i]])
      }
    }
  }
  else return null
}
DOM.prototype.first = function () {
  return new DOM([this.dom[0]])
}
DOM.prototype.select = function (path) {
  return new DOM(tagPath(this.dom, path))
}
function tagPath(dom, path) {
  if (Array.isArray(dom)) {
    var tag = path.shift()
    var dom = dom.filter(function (c) {
      return c.type === 'tag' && c.name.toLowerCase() === tag
    })
    if (path.length === 0) return dom
    else return dom.map(function (dom) { return tagPath(dom.children, path) }).reduce(function (a, b) { return a.concat(b) }, [])
  } else {
    return tagPath(dom.children, path)
  }
}