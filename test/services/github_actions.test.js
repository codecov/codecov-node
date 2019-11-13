var github_actions = require('../../lib/services/github_actions')

describe('GitHub Actions CI Provider', function() {
  it('can detect GitHub Actions', function() {
    process.env.GITHUB_ACTIONS = '1'
    expect(github_actions.detect()).to.be(true)
  })

  it('can get GitHub Actions env info', function() {
    process.env.GITHUB_SHA = '743b04806ea677403aa2ff26c6bdeb85005de658'
    process.env.GITHUB_REPOSITORY = 'codecov/codecov-repo'
    process.env.GITHUB_REF = 'refs/heads/master'

    expect(github_actions.configuration()).to.eql({
      service: 'github_actions',
      commit: '743b04806ea677403aa2ff26c6bdeb85005de658',
      branch: 'master',
      slug: 'codecov/codecov-repo',
    })
  })
})