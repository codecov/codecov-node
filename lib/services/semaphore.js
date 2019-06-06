module.exports = {
  detect: function() {
    return !!process.env.SEMAPHORE
  },

  configuration: function() {
    console.log('    Semaphore CI Detected')
    return {
      service: 'semaphore',
      branch: process.env.SEMAPHORE_GIT_BRANCH,
      build: process.env.SEMAPHORE_WORKFLOW_ID,
      commit: process.env.SEMAPHORE_GIT_SHA,
    }
  },
}
