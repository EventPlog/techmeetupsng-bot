const config = require('../config/default.json');
const fetch = require('isomorphic-fetch');

const requestPath = (path, method, data = {}) => {
  if (method === 'GET' && data.length > 0) {
    return path + '?' + encodeURIComponent(JSON.stringify(data));
  }
  return path;
};

const requestBody = (data, method) => {
  return method === 'GET' ?
    null : JSON.stringify(data);
};

/**
* @return {Object} Headers containing auth details
*/
function requestHeaders() {
  return new Headers({
    'Content-Type': 'application/json'
  });
}

/**
* @param {String} path: eg '/questions'
* @param {String} method: eg 'POST'
* @param {Object} data: eg {id: 1}
* @return {Object} fetch: to be used in views that check for success or failure
*/
function processRequest(path, method='GET', data = {}, homeURL=false) {
  console.log("[webAPI.processRequest] calling %s with %s method and data: %s",
                path, method, data);
  let hostAPI = !homeURL && process.env.TMN_API ? process.env.TMN_API : '';
  let url = hostAPI + requestPath(path, method, data);
  return fetch(url, {
    method  : method,
    headers : requestHeaders(),
    mode    : 'cors',
    cache   : 'default',
    body    : requestBody(data, method)
  })
  .then(response => response.json() )
  .catch(err => {
    console.log("[webAPI.processRequest] API call failed for %s. %s", url, err);
    // throw (err);
  });
}

module.exports = processRequest;
