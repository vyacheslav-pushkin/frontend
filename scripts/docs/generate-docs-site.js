const rimraf = require('rimraf');
const {runCmdSync} = require('../common');
const fs = require('fs');
yaml = require('js-yaml');

const highlight = '\x1b[34m%s\x1b[0m';
const success = '\x1b[32m%s\x1b[0m';

console.log(highlight, 'Generating site...');
// Clean
rimraf.sync('documentation/build');
// Generate the site from asciidoc
runCmdSync('npm run antora:gen');
// Add .nojekyll file so that site can be deployed to GitHub Pages
fs.closeSync(fs.openSync('documentation/build/site/.nojekyll', 'w'));
// Add API Reference documentation
// - Determine the branches corresponding to versions that will be documented on the site
const playbookFile = yaml.safeLoad(fs.readFileSync('documentation/antora-playbook.yml'));
const branches = playbookFile.content.sources.branches;
console.log('Branches containing documentation:', branches);
// - Checkout the repo in a temporary directory
const projectRootDir = process.cwd();
const gitTempDir = 'documentation/_temp';
runCmdSync(`mkdir ${gitTempDir}`);
runCmdSync(`cd ${gitTempDir}`);
runCmdSync('git clone https://github.com/cuba-platform/frontend.git');
// - For each branch copy the API reference files to the built site
branches.forEach(branch => {
    runCmdSync(`git checkout ${branch}`);
    // Determine version number for this branch
    const antoraYmlFile = yaml.safeLoad(fs.readFileSync('documentation/doc-component-repo/antora.yml'));
    const version = antoraYmlFile.version;
    fs.copyFileSync('documentation/api-reference', `${projectRootDir}/documentation/build/site/cuba-frontend-docs/${version}`);
});
// Cleanup
runCmdSync(`cd ${projectRootDir}`);
rimraf.sync(gitTempDir);

console.log(success, 'Documentation site has been generated successfully');