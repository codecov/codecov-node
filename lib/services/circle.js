module.exports = {

  detect : function(env){
    if (!env) {
      env = process.env;
    }
    return !!env.CIRCLECI;
  },

  configuration : function(env){
    if (!env) {
      env = process.env;
    }
    console.log('    Circle CI Detected');
    return {
      service : 'circleci',
      build : env.CIRCLE_BUILD_NUM + '.' + env.CIRCLE_NODE_INDEX,
      job : env.CIRCLE_BUILD_NUM + '.' + env.CIRCLE_NODE_INDEX,
      commit : env.CIRCLE_SHA1,
      branch : env.CIRCLE_BRANCH,
      pr: env.CIRCLE_PR_NUMBER,
      slug : env.CIRCLE_PROJECT_USERNAME + '/' + env.CIRCLE_PROJECT_REPONAME,
    };
  }

};
