var test = require('tape')
var sinon = require('sinon')
var child_process = require('child_process')

var codecov = require('../')
var cb = require('../').cb

test('Call with no args', function (t) {
  var spy = sinon.spy()
  var stub = sinon.stub(child_process, 'exec').callsFake(spy)
  codecov(['node', 'file.js'])

  stub.restore()

  t.deepEquals(spy.calledOnce, true, 'exec was called once')
  t.deepEquals(
    spy.calledWith('curl -s https://codecov.io/bash | bash -s - ', cb),
    true,
    'Called with correct args'
  )
  t.end()
})

test('Call with args', function (t) {
  var spy = sinon.spy()
  var stub = sinon.stub(child_process, 'exec').callsFake(spy)
  codecov(['node', 'file.js', '-t', 'thx1138'])

  stub.restore()

  t.deepEquals(spy.calledOnce, true, 'exec was called once')
  t.deepEquals(
    spy.calledWith('curl -s https://codecov.io/bash | bash -s - -t thx1138', cb),
    true,
    'Called with correct args'
  )
  t.end()
})