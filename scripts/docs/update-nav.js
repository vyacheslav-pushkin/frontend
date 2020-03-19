/* This script generates navigation panel for the documentation site.
 *
 * Level 1 and 2 sections will be included if they have an id:
 *
 * [[section-id]]
 * == Section Title
 *
 * [[sub-section-id]]
 * === Subsection Title
 */

const fs = require('fs');

const linkPattern = /^\[\[([a-zA-Z0-9-]*)\]\]/;
const namePattern = /^={2,3} (.*)/;

const readme = fs.readFileSync('./README.adoc', 'utf8');

let id;
let idIndex;

let nav = readme.split('\n').reduce((accumulator, line, index) => {
  if (line.match(linkPattern)) {
    id = line.match(linkPattern)[1];
    idIndex = index;
    return accumulator;
  }

  if (line.match(namePattern)) {
    const name = line.match(namePattern)[1];
    if (index === idIndex + 1) {
      const isSubsection = line.startsWith('===');
      const navItem = `${isSubsection ? '**' : '*'} link:#${id}[${name}]\n`;
      id = null;
      idIndex = null;
      return accumulator + navItem;
    } else {
      console.log('Skipping (sub)section name not preceded by an id: ' + name);
    }
  }

  return accumulator;
}, '');

if (id) {
  console.log('Skipping id not followed by (sub)section name: ' + id);
}

// Add links to API Reference documentation
nav += ('* link:#libs-api-reference[API Reference]\n' +
       '** link:api-reference/cuba-rest-js/index.html[CUBA REST JS]\n' +
       '** link:api-reference/cuba-react-core/index.html[CUBA React Core]\n' +
       '** link:api-reference/cuba-react-ui/index.html[CUBA React UI]\n');

fs.writeFileSync('./documentation/doc-component-repo/modules/ROOT/nav.adoc', nav);

console.log(`Navigation panel for documentation site has been successfully generated`);
