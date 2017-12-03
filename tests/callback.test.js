var test = require('tape')
var sinon = require('sinon')
var child_process = require('child_process')

var cb = require('../').cb

test('Callback error', function (t) {
  var spy = sinon.spy()
  var stub = sinon.stub(console, 'error').callsFake(spy)
  var log = sinon.stub(console, 'log').callsFake(spy)
  var error = new Error('Something went wrong')
  
  cb(error, 'stdout', 'stderr')

  stub.restore()
  log.restore()

  t.deepEquals(stub.calledOnce, true, 'Only called once')
  t.deepEquals(stub.calledWith(error), true, 'called with error')
  t.deepEquals(log.called, false, 'console.log not called')
  t.end()
})

test('Callback success', function (t) {
  var spy = sinon.spy()
  var stub = sinon.stub(console, 'log').callsFake(spy)
  var err = sinon.stub(console, 'error').callsFake(spy)

  cb(null, 'stdout', 'stderr')

  stub.restore()

  t.deepEquals(stub.calledOnce, true, 'Only called once')
  t.deepEquals(stub.calledWith('stdout'), true, 'Called with stdout message')
  t.deepEquals(err.called, false, 'console.error not called')
  t.end()
})