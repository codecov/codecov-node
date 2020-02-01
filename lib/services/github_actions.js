module.exports = {
    detect: function() {
      return !!process.env.GITHUB_ACTIONS
    },
  
    configuration: function() {
      console.log('    GitHub Actions CI Detected')
      return {
        service: 'github-actions',
        commit: process.env.GITHUB_SHA,
        branch: process.env.GITHUB_REF.replace("refs/heads/", ""),
        slug: process.env.GITHUB_REPOSITORY,
      }
    },
  }
