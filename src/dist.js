// Entry point for standalone build
const index = require('./')
index.localStorage = require('./browser')
module.exports = index
