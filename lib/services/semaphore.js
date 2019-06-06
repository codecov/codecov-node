module.exports = {
  detect: function() {
    return !!process.env.SEMAPHORE
  },

  configuration: function() {
    console.log('    Semaphore CI Detected')
    return {
      service: 'semaphore',
      commit: process.env.SEMAPHORE_GIT_SHA,
      branch: process.env.SEMAPHORE_GIT_BRANCH,
    }
  },
}
