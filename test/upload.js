var fs = require('fs');
var codecov = require("../lib/codecov");
var execSync = require('child_process').execSync;
if (!execSync) {
  var exec = require('execSync').exec;
  var execSync = function(cmd){
    return exec(cmd).stdout;
  };
}


describe("Codecov", function(){
  it("can get upload to v2", function(done){
    codecov.sendToCodecovV2('https://codecov.io',
                            {
                              token: 'f881216b-b5c0-4eb1-8f21-b51887d1d506',
                              commit: 'c739768fcac68144a3a6d82305b9c4106934d31a',
                              branch: 'master'
                            },
                            'testing node-'+codecov.version,
                            function(body){
                              expect(body).to.contain('http://codecov.io/github/codecov/ci-repo?ref=c739768fcac68144a3a6d82305b9c4106934d31a');
                              done();
                            },
                            function(err){
                              throw err;
                            });
  });

  it("can get upload to v3", function(done){
    codecov.sendToCodecovV3('https://codecov.io',
                            {
                              token: 'f881216b-b5c0-4eb1-8f21-b51887d1d506',
                              commit: 'c739768fcac68144a3a6d82305b9c4106934d31a',
                              branch: 'master'
                            },
                            'testing node-'+codecov.version,
                            function(body){
                              expect(body).to.contain('http://codecov.io/github/codecov/ci-repo?ref=c739768fcac68144a3a6d82305b9c4106934d31a');
                              done();
                            },
                            function(err){
                              throw err;
                            });
  });

});
