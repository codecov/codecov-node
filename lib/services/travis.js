module.exports = {

  detect : function(env){
    if (!env) {
      env = process.env;
    }
    return !!env.TRAVIS;
  },

  configuration : function(env){
    if (!env) {
      env = process.env;
    }
    console.log('    Travis CI Detected');
    return {
      service : 'travis',
      commit : env.TRAVIS_COMMIT,
      build : env.TRAVIS_JOB_NUMBER,
      branch : env.TRAVIS_BRANCH,
      job : env.TRAVIS_JOB_ID,
      pr: env.TRAVIS_PULL_REQUEST,
      slug : env.TRAVIS_REPO_SLUG
    };
  }

};
