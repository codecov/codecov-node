var fs = require('fs');
var globby = require('globby');
var request = require('request');
var urlgrey = require('urlgrey');
var execSync = require('child_process').execSync;
if (!execSync) {
  var exec = require('execSync').exec;
  var execSync = function(cmd){
    return exec(cmd).stdout;
  };
}

var detectProvider = require('./detect');

var version = "v1.0.1";

/**
 * Concatenate array of strings by comma
 * @param patterns Array of strings to join
 */
function patternsToString(patterns) {
  return '{' + patterns.join(',') + '}';
}

/**
 * Get arrays of include and excluded files
 */
function getPatterns() {
  return {
    include: [
      // include
      '**/*coverage.*',
      '**/nosetests.xml',
      '**/jacoco*.xml',
      '**/clover.xml',
      '**/report.xml',
      '**/cobertura.xml',
      '**/luacov.report.out',
      '**/lcov.info',
      '**/*.lcov',
      '**/gcov.info',
      '**/*.gcov',
      '**/*.lst'
    ],


    // exclude
    exclude: [
      '**/*.sh',
      '**/*.data',
      '**/*.py',
      '**/*.class',
      '**/*.xcconfig',
      '**/Coverage.profdata',
      '**/phpunit-code-coverage.xml',
      '**/coverage.serialized',
      '**/*.pyc',
      '**/*.cfg',
      '**/*.egg',
      '**/*.whl',
      '**/*.html',
      '**/*.js',
      '**/*.cpp',
      '**/coverage.jade',
      '**/include.lst',
      '**/inputFiles.lst',
      '**/createdFiles.lst',
      '**/coverage.html',
      '**/scoverage.measurements.*',
      '**/test_*_coverage.txt',
      '**/vendor/**/*',
      '**/htmlcov/**/*',
      '**/home/cainus/**/*',
      '**/virtualenv/**/*',
      '**/js/generated/coverage/**/*',
      '**/.virtualenv/**/*',
      '**/virtualenvs/**/*',
      '**/.virtualenvs/**/*',
      '**/.env/**/*',
      '**/.envs/**/*',
      '**/env/**/*',
      '**/envs/**/*',
      '**/.venv/**/*',
      '**/.venvs/**/*',
      '**/venv/**/*',
      '**/venvs/**/*',
      '**/.git/**/*',
      '**/.hg/**/*',
      '**/.tox/**/*',
      '**/__pycache__/**/*',
      '**/.egg-info*',
      '**/$bower_components/**/*',
      '**/node_modules/**/*',
      '**/conftest_*.c.gcov'
    ]
  };
}

var sendToCodecovV2 = function(codecov_endpoint, query, upload_body, on_success, on_failure){
  // Direct to Codecov
  request.post(
    {
      url : urlgrey(codecov_endpoint + '/upload/v2').query(query).toString(),
      body : upload_body,
      headers : {
        'Content-Type': 'text/plain',
        'Accept': 'text/plain'
      }
    }, function(err, response, result){
      if (err || response.statusCode !== 200) {
        console.log('    ' + (err || response.body));
        return on_failure(response.statusCode, response.body);

      } else {
        console.log('    Success!');
        console.log('    View report at: ' + response.body);
        return on_success(response.body);

      }
    }
  );

};


var sendToCodecovV3 = function(codecov_endpoint, query, upload_body, on_success, on_failure){
  // Direct to S3
  request.post(
    {
      url : urlgrey(codecov_endpoint + '/upload/v3').query(query).toString(),
      body : '',
      headers : {
        'Content-Type': 'text/plain',
        'Accept': 'text/plain'
      }
    }, function(err, response, result){
      if (err) {
        sendToCodecovV2(codecov_endpoint, query, upload_body, on_success, on_failure);

      } else {
        var codecov_report_url = result.split('\n')[0];
        request.put(
          {
            url : result.split('\n')[1],
            body : upload_body,
            headers : {
              'Content-Type': 'plain/text',
              'x-amz-acl': 'public-read'
            }
          }, function(err, response, result){
            if (err) {
              sendToCodecovV2(codecov_endpoint, query, upload_body, on_success, on_failure);

            } else {
              console.log('    Success!');
              console.log('    View report at: ' + codecov_report_url);
              on_success(codecov_report_url);
            }
          }
        );
      }
    }
  );

};


var upload = function(args, on_success, on_failure){
  // Build query
  var codecov_endpoint = (args.options.url || process.env.codecov_url || process.env.CODECOV_URL || 'https://codecov.io');
  var query = {};
  var debug = [];

  console.log(''+
'  _____          _  \n' +
' / ____|        | |  \n' +
'| |     ___   __| | ___  ___ _____   __  \n' +
'| |    / _ \\ / _` |/ _ \\/ __/ _ \\ \\ / /  \n' +
'| |___| (_) | (_| |  __/ (_| (_) \\ V /  \n' +
' \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/  \n' +
'                                ' + version);

  if ((args.options.disable || '').split(',').indexOf('detect') === -1) {
    console.log('==> Detecting CI Provider');
    query = detectProvider();
  } else {
    debug.push('disabled detect');
  }

  if (args.options.build) {
    query.build = args.options.build;
  }

  if (args.options.commit) {
    query.commit = args.options.commit;
  }

  if (args.options.branch) {
    query.branch = args.options.branch;
  }

  if (args.options.slug) {
    query.slug = args.options.slug;
  }

  var token = (args.options.token || process.env.codecov_token || process.env.CODECOV_TOKEN);
  if (token){
    query.token = token;
  }

  query.package = 'node-' + version;

  console.log("==> Configuration: ");
  console.log("    Endpoint: " + codecov_endpoint);
  console.log(query);

  var upload = "";
  var patterns = getPatterns();

  // Add specified env vars
  var env_found = false;
  if (args.options.env || process.env.CODECOV_ENV || process.env.codecov_env) {
    var env = (args.options.env + ',' + (process.env.CODECOV_ENV || '') + ',' + (process.env.codecov_env || '')).split(',');
    for (var i = env.length - 1; i >= 0; i--) {
      if (env[i]) {
        upload += env[i] + '=' + (process.env[env[i]] || '').toString() + '\n';
        env_found = true;
      }
    }
    if (env_found) {
      upload += '<<<<<< ENV\n';
    }
  }

  // List git files
  var root = args.options.root || query.root || '.';
  console.log('==> Building file structure');
  upload += execSync('cd '+root+' && git ls-files || hg locate').toString().trim() + '\n<<<<<< network\n';

  // Make gcov reports
  if ((args.options.disable || '').split(',').indexOf('gcov') === -1) {
    try {
      console.log('==> Generating gcov reports (skip via --disable=gcov)');
      var gcg = args.options['gcov-glob'] || '';
      if (gcg) {
        gcg = gcg.split(' ').map(function(p){return "-not -path '"+p+"'";}).join(' ');
      }
      var gcov = "find "+(args.options['gcov-root'] || root)+" -type f -name '*.gcno' "+gcg+" -exec "+(args.options['gcov-exec'] || 'gcov')+" "+(args.options['gcov-args'] || '')+" {} +";
      debug.push(gcov);
      console.log('    $ '+gcov);
      execSync(gcov);
    } catch (e) {
      console.log('    Failed to run gcov command.');
    }
  } else {
    debug.push('disabled gcov');
  }

  // Detect .bowerrc
  var bowerrc = globby.sync('.bowerrc', { root: root, nosort: true });
  if (bowerrc.length === 1) {
    bowerrc = fs.readFileSync(bowerrc[0], 'utf8');
    bowerrc = JSON.parse(bowerrc).directory;
    if (bowerrc) {
      patterns.exclude.push(bowerrc.toString().replace(/\/$/, '') + '/**/*');
    }
  }

  var files = [], file = null;
  // Append manually entered reports
  if (args.options.file) {
    file = args.options.file;
    console.log('==> Targeting specific file');
    try {
      upload += '# path=' + file + '\n' + fs.readFileSync(file, 'utf8').toString() + '\n<<<<<< EOF\n';
      console.log('    + ' + file);
      files.push(file);
    } catch (e) {
      debug.push('failed: ' + file.split('/').pop());
      console.log('    X Failed to read file at ' + file);
    }
  } else if ((args.options.disable || '').split(',').indexOf('search') === -1) {
    console.log('==> Scanning for reports');
    var _files = globby.sync(
      patternsToString(patterns.include),
      {
        cwd : root,
        nosort: true,
        nocase: true,
        ignore: patternsToString(patterns.exclude)
      }
    );

    if (_files) {
      for (var i2 = _files.length - 1; i2 >= 0; i2--) {
        file = _files[i2];
        try {
          upload += '# path=' + file + '\n' + fs.readFileSync(file, 'utf8').toString() + '\n<<<<<< EOF\n';
          console.log('    + ' + file);
          files.push(file);
        } catch (e) {
          debug.push('failed: ' + file.split('/').pop());
          console.log('    X Failed to read file at ' + file);
        }
      }
    }
  } else {
    debug.push('disabled search');
  }

  if (files) {
    // Upload to Codecov
    if (args.options.dump) {
      console.log('-------- DEBUG START --------');
      console.log(upload);
      console.log('-------- DEBUG END --------');

    } else {
      console.log('==> Uploading reports');
      sendToCodecovV3(codecov_endpoint, query, upload, on_success || function(){}, on_failure || function(){});
    }
  }

  return {
    body: upload,
    files: files,
    query: query,
    debug: debug,
    url: codecov_endpoint
  };

};

module.exports = {
  upload: upload,
  version: version,
  sendToCodecovV2: sendToCodecovV2,
  sendToCodecovV3: sendToCodecovV3
};
