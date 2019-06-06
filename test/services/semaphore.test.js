var semaphore = require('../../lib/services/semaphore')

describe('Semaphore CI Provider', function() {
  it('can detect semaphore', function() {
    process.env.SEMAPHORE = 'true'
    expect(semaphore.detect()).toBe(true)
  })

  it('can get semaphore env info', function() {
    process.env.SEMAPHORE_GIT_SHA = '5c84719708b9b649b9ef3b56af214f38cee6acde'
    process.env.SEMAPHORE_GIT_BRANCH = 'development'
    expect(semaphore.configuration()).toEqual({
      service: 'semaphore',
      commit: '5c84719708b9b649b9ef3b56af214f38cee6acde',
      branch: 'development',
    })
  })
})
