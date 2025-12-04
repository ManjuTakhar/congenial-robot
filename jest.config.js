module.exports = {
    // The test environment that will be used for testing
    testEnvironment: 'node',

    // Automatically clear mocks between every test
    clearMocks: true,

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // An array of file extensions your modules use
    moduleFileExtensions: [ 'js', 'json', 'jsx', 'ts', 'tsx', 'node' ],

    // The glob patterns Jest uses to detect test files
    testMatch: [ '**/cron_parser.test.js' ],

    // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    }
};
