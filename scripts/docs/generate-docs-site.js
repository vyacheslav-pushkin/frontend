const {runCmdSync} = require('../common');
const fs = require('fs');
const childProcess = require('child_process');

fs.copyFileSync('README.adoc', 'documentation/doc-component-repo/modules/ROOT/pages/index.adoc');
childProcess.fork(__dirname + '/update-nav.js');
runCmdSync('npm run antora:gen');
// create .nojekyll file to allow deploying to GitHub pages:
fs.closeSync(fs.openSync('documentation/build/site/.nojekyll', 'w'));