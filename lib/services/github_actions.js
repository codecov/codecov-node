module.exports = {
    detect: () => {
      return !!process.env.GITHUB_ACTIONS
    },
  
    configuration: () => {
      console.log('    GitHub Actions CI Detected')
      return {
        service: 'github_actions',
        commit: process.env.GITHUB_SHA,
        branch: getBranch(),
        slug: process.env.GITHUB_REPOSITORY,
      }

      getBranch = () => {
        let currRef = process.env.GITHUB_REF
        return currRef.replace("refs/heads/", "")
      }
    },
  }