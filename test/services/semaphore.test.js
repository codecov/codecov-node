var semaphore = require('../../lib/services/semaphore')

describe('Semaphore CI Provider', function() {
  it('can detect semaphore', function() {
    process.env.SEMAPHORE = 'true'
    expect(semaphore.detect()).toBe(true)
  })

  it('can get semaphore env info', function() {
    process.env.SEMAPHORE_GIT_BRANCH = 'development'
    process.env.SEMAPHORE_GIT_SHA = '5c84719708b9b649b9ef3b56af214f38cee6acde'
    process.env.SEMAPHORE_WORKFLOW_ID = '65c9bb1c-aeb6-41f0-b8d9-6fa177241cdf'
    expect(semaphore.configuration()).toEqual({
      service: 'semaphore',
      branch: 'development',
      build: '65c9bb1c-aeb6-41f0-b8d9-6fa177241cdf',
      commit: '5c84719708b9b649b9ef3b56af214f38cee6acde',
    })
  })
})
