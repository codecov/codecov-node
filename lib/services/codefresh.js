module.exports = {
  detect: function() {
    return !!process.env.CF_URL
  },

  configuration: function() {
    console.log('    Codefresh CI Detected')
    return {
      service: 'codefresh',
      commit: process.env.CF_REVISION,
      build: process.env.CF_BUILD_ID,
      branch: process.env.CF_BRANCH,
      pr: process.env.PULL_REQUEST_NUMBER,
      slug: process.env.CF_REPO_OWNER + '/' + process.env.CF_REPO_NAME,
    }
  },
}
