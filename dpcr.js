const _ = require('lodash');
const request = require('request-promise');

const JSON_HIJACKING_PREFIX = '])}while(1);</x>';
const DOCKER_HUB_API_URL = 'https://hub.docker.com/v2/repositories/';

function generateDockerHubApiUri(repositoryName) {
  return `${DOCKER_HUB_API_URL}${repositoryName}`;
}

function massageHijackedPreventionResponse(response) {
  return JSON.parse(response.replace(JSON_HIJACKING_PREFIX, ''));
}

function extractPullCount(repositoryData) {
  return _.get(repositoryData, 'pull_count', 0);
}

function getPullsForRepository(repositoryName) {
  const options = {
    uri: generateDockerHubApiUri(repositoryName),
    transform: massageHijackedPreventionResponse,
  };

  return request(options)
    .then((repositoryData) => {
      const pullCount = extractPullCount(repositoryData);
      return Promise.resolve(pullCount);
    });
}

// Get the repository name from the command line arguments
const repositoryName = process.argv[2];

// Check if repository name is provided
if (!repositoryName) {
  console.error('Please provide a Docker repository name.');
} else {
  // Call the function with the specified repository name
  getPullsForRepository(repositoryName)
    .then(console.log)
    .catch((error) => {
      console.error('Error:', error.message);
    });
}
