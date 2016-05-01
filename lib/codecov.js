var fs = require('fs');
var request = require('request');
var urlgrey = require('urlgrey');
var execSync = require('./exec-sync');

var detectProvider = require('./detect');

var root;

var version = "v1.0.1";

var glob = require('glob')

var fileNamePatterns = [
  '*coverage.*',
  'nosetests.xml',
  'jacoco*.xml',
  'clover.xml',
  'report.xml',
  'cobertura.xml',
  'luacov.report.out',
  'lcov.info',
  '*.lcov',
  'gcov.info',
  '*.gcov',
  '*.lst'
];

var fileNameExcludes = [
  '*.sh',
  '*.data',
  '*.py',
  '*.class',
  '*.xcconfig',
  'Coverage.profdata',
  'phpunit-code-coverage.xml',
  'coverage.serialized',
  '*.pyc',
  '*.cfg',
  '*.egg',
  '*.whl',
  '*.html',
  '*.js',
  '*.cpp',
  'coverage.jade',
  'include.lst',
  'inputFiles.lst',
  'createdFiles.lst',
  'coverage.html',
  'scoverage.measurements.*',
  'test_*_coverage.txt',
  'conftest_*.c.gcov',
  '.egg-info*'
];

var pathExcludes = [
  'vendor',
  'htmlcov',
  'home/cainus',
  'virtualenv',
  'js/generated/coverage',
  '.virtualenv',
  'virtualenvs',
  '.virtualenvs',
  '.env',
  '.envs',
  'env',
  'envs',
  '.venv',
  '.venvs',
  'venv',
  'venvs',
  '.git',
  '.hg',
  '.tox',
  '__pycache__',
  '.egg-info*',
  '$bower_components',
  'node_modules'
];

var sendToCodecovV2 = function(codecov_endpoint, query, upload_body, on_success, on_failure){
  on_success = on_success || function () {};
  on_failure = on_failure || function () {};

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
  on_success = on_success || function () {};
  on_failure = on_failure || function () {};

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

var get_endpoint = function (args) {
  return args.options.url ||
    process.env.codecov_url ||
    process.env.CODECOV_URL ||
    'https://codecov.io';
};

var banner = function () {
  console.log(''+
    '  _____          _  \n' +
    ' / ____|        | |  \n' +
    '| |     ___   __| | ___  ___ _____   __  \n' +
    '| |    / _ \\ / _` |/ _ \\/ __/ _ \\ \\ / /  \n' +
    '| |___| (_) | (_| |  __/ (_| (_) \\ V /  \n' +
    ' \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/  \n' +
    '                                ' + version);
};

var is_disabled = function (args, key) {
  return !is_enabled(args, key);
}

var is_enabled = function (args, key) {
  return (args.options.disable || '').split(',').indexOf(key) === -1
};

var build_query = function (args) {
  var query;
  if (is_enabled(args, 'detect')) {
    console.log('==> Detecting CI Provider');
    query = detectProvider();
  } else {
    debug('disabled detect');
    query = {};
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

  return query;
};

var env_var_upload = function (args) {
  // Add specified env vars
  var upload = "";
  var env_found = false;
  if (args.options.env || process.env.CODECOV_ENV || process.env.codecov_env) {

    var env = [];
    if (args.options.env) {
      env.push(args.options.env);
    }

    if (process.env.CODECOV_ENV) {
      env.push(process.env.CODECOV_ENV);
    }

    if (process.env.codecov_env) {
      env.push(process.env.codecov_env);
    }

    env = env.join(',').split(',');

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

  return upload;
};

var vcs_files_upload = function (args) {
  // List git files
  console.log('==> Building file structure');
  var list = execSync('cd '+root+' && git ls-files || hg locate');
  return list.toString().trim() + '\n<<<<<< network\n';
};

var generate_gcov = function (args) {
  // Make gcov reports
  if (is_enabled(args, 'gcov')) {
    try {
      console.log('==> Generating gcov reports (skip via --disable=gcov)');
      var gcg = args.options['gcov-glob'] || '';
      if (gcg) {
        gcg = gcg.split(' ').map(function (p) {
          return "-not -path '"+p+"'";
        }).join(' ');
      }

      var gcov = "find " +
        (args.options['gcov-root'] || root) +
        " -type f -name '*.gcno' " +
        gcg +
        " -exec " +
        (args.options['gcov-exec'] || 'gcov') +
        " " +
        (args.options['gcov-args'] || '') +
        " {} +";

      debug(gcov);
      console.log('    $ '+gcov);
      execSync(gcov);
    } catch (e) {
      debug(e);
      console.log('    Failed to run gcov command.');
    }
  } else {
    debug('disabled gcov');
  }
};

var get_bowerrc_patterns = function (args) {
  // Detect .bowerrc
  try {
    var bowerrc = fs.readFileSync(root + '/.bowerrc', 'utf8');
    return JSON.parse(bowerrc).directory.replace(/\/$/, '');
  } catch (er) {
    // any kind of error, whether because file doesn't exist,
    // or not JSON, or directory is not a string, just ignore it.
    return null;
  }
};

var _debug_log = [];
var debug = function (msg) {
  _debug_log.push(msg);
}
var debug_reset = function () {
  _debug_log = [];
}

var get_files = function (args) {
  if (args.options.file) {
    console.log('==> Targeting specific file');
    return [ args.options.file ];
  } else if (is_enabled(args, 'search')) {
    var more_patterns = get_bowerrc_patterns(args);
    var excludes = pathExcludes.map(function (exclude) {
      return '**/' + exclude + '/**';
    }).concat(fileNameExcludes.map(function (exclude) {
      return '**/' + exclude;
    }));
    if (more_patterns) {
      excludes.push('**/' + more_patterns + '/**');
    }
    console.log('==> Scanning for reports');

    // Do it all in one @() extglob set for greater speed.
    // This works because none of the file name patterns contain /
    var patterns = '**/@(' + fileNamePatterns.join('|') + ')'
    var out = glob.sync(patterns, {
      ignore: excludes,
      cwd: root
    });

    return out;
  } else {
    debug('disabled search');
    return [];
  }
};

var get_file_contents = function (file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (er) {
    debug('failed: ' + file.split('/').pop());
    console.log('    X Failed to read file at ' + file);
    return '';
  }
};


var upload = function(args, on_success, on_failure) {
  // Build query
  var codecov_endpoint = get_endpoint(args);
  debug_reset();

  banner();

  var query = build_query(args);

  root = args.options.root || query.root || '.';
  console.log("==> Configuration: ");
  console.log("    Endpoint: " + codecov_endpoint);
  console.log(query);

  var upload = "";

  upload += env_var_upload(args);
  upload += vcs_files_upload(args);

  generate_gcov(args);

  var files = get_files(args).filter(function (file) {
    var contents = get_file_contents(file);
    if (!contents) {
      return false;
    }
    console.log('    + ' + file);
    upload += '# path=' + file + '\n' + contents + '\n<<<<<< EOF\n';
    return true;
  });

  // Upload to Codecov
  if (args.options.dump) {
    console.log('-------- DEBUG START --------');
    console.log(upload);
    console.log('-------- DEBUG END --------');

  } else {
    console.log('==> Uploading reports');
    sendToCodecovV3(codecov_endpoint, query, upload, on_success, on_failure);
  }

  return {
    body: upload,
    files: files,
    query: query,
    debug: _debug_log,
    url: codecov_endpoint
  };

};

module.exports = {
  upload: upload,
  version: version,
  sendToCodecovV2: sendToCodecovV2,
  sendToCodecovV3: sendToCodecovV3
};
