var cp = require('child_process')

function cb (err, stdout, stderr) {
  if (err) { console.error(err); return }
  console.log(stdout)
}

function codecov (argv) {
  var args = argv.slice(2).join(' ')
  cp.exec('curl -s https://codecov.io/bash | bash -s - ' + args, cb)
}

module.exports = codecov
module.exports.cb = cb