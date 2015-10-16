var execSync = require('child_process').execSync;


module.exports = {

  detect : function(env){
    if (!env) {
      env = process.env;
    }
    return !!env.DRONE;
  },

  configuration : function(env){
    if (!env) {
      env = process.env;
    }
    console.log('    Drone.io CI Detected');
    return {
      service : 'drone.io',
      build : env.DRONE_BUILD_NUMBER,
      commit : eexecSync("git rev-parse HEAD || hg id -i --debug | tr -d '+'").toString().trim(),
      build_url : env.DRONE_BUILD_URL,
      branch : env.DRONE_BRANCH
    };
  }

};
