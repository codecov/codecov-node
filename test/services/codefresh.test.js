var codefresh = require('../../lib/services/codefresh')

describe('Codefresh CI Provider', function () {
  it('can detect codefresh', function () {
    process.env.CF_URL = 'https://g.codefresh.io'
    expect(codefresh.detect()).toBe(true)
  })
  it('can get codefresh env info get_commit_status', function () {
    process.env.CF_URL = 'https://g.codefresh.io'
    process.env.CF_REVISION = '5678';
    process.env.CF_BUILD_ID = '91011';
    process.env.CF_BRANCH = 'main';
    process.env.PULL_REQUEST_NUMBER = 'blah';
    process.env.CF_REPO_OWNER = 'owner'
    process.env.CF_REPO_NAME = 'repo';
    expect(codefresh.configuration()).toEqual({
      service: 'codefresh',
      commit: '5678',
      build: '91011',
      branch: 'main',
      pr: 'blah',
      slug: 'owner/repo',
    })
  })
})
