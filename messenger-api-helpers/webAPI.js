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
function processRequest(path, method='GET', data = {}) {
  console.log("[webAPI.processRequest] calling %s with %s method and data: %s",
                path, method, data);
  let url = process.env.TMN_API + requestPath(path, method, data);
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

  // return request({
  //   uri: url,
  //   method: 'GET'
  // }, (error, response, body) => {
  //   console.log("[webAPI.processRequest] response: %o", response)
  //   return response.json()
  // })
}

module.exports = processRequest;
