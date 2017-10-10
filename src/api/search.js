let es = require('elasticsearch')

import config from '../config'
import _ from 'lodash'
import { slugify } from '../lib/filters'

let client = new es.Client({
  host: config.elasticsearch.host,
  httpAuth: config.elasticsearch.httpAuth,
  log: 'debug',
  apiVersion: '5.5',
  requestTimeout: 5000
})

/**
 * Helper function to handle ElasticSearch Results
 * @param {Object} resp result from ES call
 * @param {Int} start pagination data
 * @param {Int} size pagination data
 */
function _handleEsResult (resp, start = 0, size = 50) {
  if (resp == null) {
    throw new Error('Invalid ES result - null not exepcted')
  }
  if (resp.hasOwnProperty('hits')) {
    return {
      items: _.map(resp.hits.hits, function (hit) {
        return Object.assign(hit._source, { _score: hit._score, slug: hit._source.hasOwnProperty('name') ? slugify(hit._source.name) + '-' + hit._source.id : '' }) // TODO: assign slugs server side
      }), // TODO: add scoring information
      total: resp.hits.total,
      start: start,
      pageSize: size,
      aggregations: resp.aggregations
    }
  } else {
    if (resp.error) {
      throw new Error(JSON.stringify(resp.error))
    } else {
      throw new Error('Unknown error with ES result in _handleEsResult')
    }
  }
}

/**
 * Search ElasticSearch catalog of products using simple text query
 * Use bodybuilder to build the query, aggregations etc: http://bodybuilder.js.org/
 * @param {Object} query elasticSearch request body
 * @param {Int} start start index
 * @param {Int} size page size
 * @return {Promise}
 */
export function quickSearchByQuery ({ query, start = 0, size = 50, entityType = 'product' }) {
  size = parseInt(size)
  if (size <= 0) size = 50
  if (start < 0) start = 0

  return new Promise((resolve, reject) => {
    client.search({
      index: config.elasticsearch.index, // TODO: add grouped prodduct and bundled product support
      type: entityType,
      body: query,
      size: size,
      from: start
    }).then(function (resp) {
      resolve(_handleEsResult(resp, start, size))
    }).catch(function (err) {
      reject(err)
    })
  })
}

  /**
   * Search ElasticSearch catalog of products using simple text query
   * @param {String} queryText full text search query
   * @param {Int} start start index
   * @param {Int} size page size
   * @return {Promise}
   */
export function quickSearchByText ({ queryText, start = 0, size = 50 }) {
  size = parseInt(size)
  if (size <= 0) size = 50
  if (start < 0) start = 0

  return new Promise((resolve, reject) => {
    client.search({
      index: config.elasticsearch.index, // TODO: add grouped prodduct and bundled product support
      type: 'product',
      q: queryText,
      size: size,
      from: start
    }).then(function (resp) {
      resolve(_handleEsResult(resp, start, size))
    }).catch(function (err) {
      reject(err)
    })
  })
}
