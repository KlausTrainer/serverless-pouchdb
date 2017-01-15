'use strict'

const pouchCore = require('pouchdb-core')
const pouchReplication = require('pouchdb-replication')
const pouchMapreduce = require('pouchdb-mapreduce')
const CoreLevelPouch = require('pouchdb-adapter-leveldb-core')
const ExpressPouchDB = require('express-pouchdb')
const express = require('express')
const corser = require('corser')
const DynamoDBDown = require('dynamodbdown')
const awsServerlessExpress = require('aws-serverless-express')

const config = require('./config.json') // contains AWS dynamodb credentials and configuration

function customLevelAdapter (db) {
  function CustomLevelPouch (opts, callback) {
    const _opts = Object.assign({
      db: db,
      dynamodb: config.dynamodb
    }, opts)

    CoreLevelPouch.call(this, _opts, callback)
  }

  CustomLevelPouch.valid = function () {
    return true
  }

  CustomLevelPouch.use_prefix = false

  return function (PouchDB) {
    PouchDB.adapter('custom-leveldb', CustomLevelPouch, true)
  }
}

function cors () {
  const corsMiddleware = corser.create({
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'COPY'],
    supportsCredentials: true,
    requestHeaders: corser.simpleRequestHeaders.concat(['Authorization', 'Origin', 'Referer'])
  })

  return function (req, res, next) {
    corsMiddleware(req, res, next)
  }
}

function preventWrites (body, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  const docs = Array.isArray(body) ? body : body.docs

  const unauthorizedErrors = docs.map(function (doc) {
    return {id: doc._id, error: 'forbidden', reason: 'read-only db'}
  })

  return callback(null, unauthorizedErrors)
}

const PouchDB = pouchCore
  .plugin(pouchReplication)
  .plugin(pouchMapreduce)
  .plugin(customLevelAdapter(DynamoDBDown))
  .plugin({bulkDocs: preventWrites})

const expressPouchDB = ExpressPouchDB(PouchDB, {
  inMemoryConfig: true,
  mode: 'minimumForPouchDB'
})

const app = express()

app.use(cors())
app.use(expressPouchDB)

const server = awsServerlessExpress.createServer(app)

module.exports.api = (event, context) => awsServerlessExpress.proxy(server, event, context)
