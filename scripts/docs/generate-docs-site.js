const rimraf = require('rimraf');
const {runCmdSync} = require('../common');
const fs = require('fs');
yaml = require('js-yaml');

const highlight = '\x1b[34m%s\x1b[0m';
const success = '\x1b[32m%s\x1b[0m';

console.log(highlight, 'Generating site...');
rimraf.sync('documentation/build');
// Generate the site from asciidoc
runCmdSync('npm run antora:gen');
// Add .nojekyll file so that site can be deployed to GitHub Pages
fs.closeSync(fs.openSync('documentation/build/site/.nojekyll', 'w'));
// // Copy API reference
// fs.copyFileSync('documentation/api-reference', 'documentation/build/')

console.log(success, 'Documentation site has been generated successfully');