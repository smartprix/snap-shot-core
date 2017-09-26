'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const Result = require('folktale/result')
const jsesc = require('jsesc')
const stripIndent = require('common-tags').stripIndent

// TODO: we should also consider the file spec name + test name
// not just spec name (which is test name here)
function snapshotIndex ({counters, file, specName}) {
  la(is.object(counters), 'expected counters', counters)
  la(is.unemptyString(specName), 'expected specName', specName)
  la(is.unemptyString(file), 'missing filename', file)

  if (!(specName in counters)) {
    counters[specName] = 1
  } else {
    counters[specName] += 1
  }
  return counters[specName]
}

// make sure values in the object are "safe" to be serialized
// and compared from loaded value
function strip (o) {
  if (is.fn(o)) {
    return o
  }
  return JSON.parse(JSON.stringify(o))
}

function compare ({expected, value}) {
  const e = JSON.stringify(expected)
  const v = JSON.stringify(value)
  if (e === v) {
    return Result.Ok()
  }
  return Result.Error(`${e} !== ${v}`)
}

const sameTypes = (a, b) => typeof expected === typeof value

const compareTypes = ({expected, value}) =>
  sameTypes(expected, value) ? Result.Ok() : Result.Error('no message')

function exportText (name, value) {
  la(is.unemptyString(name), 'expected snapshot name, got:', name)
  if (!is.unemptyString(value)) {
    const message = stripIndent`
      Cannot store empty / null / undefined string as a snapshot value.
      Seems the value you are trying to store in a snapshot "${name}"
      is empty. Snapshots only work well if they have actual content
      to store. Otherwise, why bother?
    `
    throw new Error(message)
  }
  la(is.unemptyString(value), 'expected string value', value)
  const withNewLines = '\n' + value + '\n'
  return `exports['${name}'] = \`${withNewLines}\`\n`
}

function exportObject (name, value) {
  const serialized = jsesc(value, {
    json: true,
    compact: false,
    indent: '  '
  })
  return `exports['${name}'] = ${serialized}\n`
}

const isSurroundedByNewLines = (s) =>
  is.string(s) && s.length > 1 && s[0] === '\n' && s[s.length - 1] === '\n'

// when we save string snapshots we add extra new lines to
// avoid long first lines
// when loading snapshots we should remove these new lines
// from string properties
function removeExtraNewLines (snapshots) {
  Object.keys(snapshots).forEach(key => {
    const value = snapshots[key]
    if (isSurroundedByNewLines(value)) {
      snapshots[key] = value.substr(1, value.length - 2)
    }
  })
  return snapshots
}

module.exports = {
  snapshotIndex,
  strip,
  compare,
  sameTypes,
  compareTypes,
  exportText,
  exportObject,
  removeExtraNewLines
}
