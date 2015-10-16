module.exports = {

  detect : function(env){
    if (!env) {
      env = process.env;
    }
    return !!env.BUILDKITE;
  },

  configuration : function(env){
    // https://buildkite.com/docs/guides/environment-variables
    console.log('    Buildkite CI Detected');
    if (!env) {
      env = process.env;
    }
    return {
      service : 'buildkite',
      build : env.BUILDKITE_BUILD_NUMBER,
      build_url : env.BUILDKITE_BUILD_URL,
      commit : env.BUILDKITE_COMMIT,
      branch : env.BUILDKITE_BRANCH,
      slug : env.BUILDKITE_PROJECT_SLUG
    };
  }

};
