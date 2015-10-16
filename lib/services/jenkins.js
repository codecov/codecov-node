module.exports = {

  detect : function(env){
    if (!env) {
      env = process.env;
    }
    return !!env.JENKINS_URL;
  },

  configuration : function(env){
    if (!env) {
      env = process.env;
    }
    console.log('    Jenkins CI Detected');
    return {
      service : 'jenkins',
      commit : env.ghprbActualCommit || env.GIT_COMMIT,
      branch : env.ghprbSourceBranch || env.GIT_BRANCH,
      build :  env.BUILD_NUMBER,
      build_url :  env.BUILD_URL,
      pr : env.ghprbPullId
    };
  }

};
