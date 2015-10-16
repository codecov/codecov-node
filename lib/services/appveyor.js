module.exports = {

  detect : function(env){
    if (!env) {
      env = process.env;
    }
    return !!env.APPVEYOR;
  },

  configuration : function(env){
    console.log('    AppVeyor CI Detected');
    if (!env){
      env = process.env;
    }
    return {
      service : 'appveyor',
      commit : env.APPVEYOR_REPO_COMMIT,
      branch : env.APPVEYOR_REPO_BRANCH,
      pr : env.APPVEYOR_PULL_REQUEST_NUMBER,
      job: env.APPVEYOR_ACCOUNT_NAME + '/' + env.APPVEYOR_PROJECT_SLUG + '/' + env.APPVEYOR_BUILD_VERSION,
      build: env.APPVEYOR_JOB_ID,
      slug : env.APPVEYOR_REPO_NAME
    };
  }

};
