const packClientLibs = require('./pack-client-libs');

packClientLibs(
    [
        '@cuba-platform/front-generator',
        '@cuba-platform/rest',
        '@cuba-platform/react-core'
    ],
    [
        '@cuba-platform/rest',
        '@cuba-platform/react-core'
    ]
);

