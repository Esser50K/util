#!/usr/bin/env node

const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const optionDefinitions = [{
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.'
  },
  {
    name: 'name',
    type: String,
    multiple: false,
    description: 'The name for the API'
  },
  {
    name: 'dest',
    type: String,
    multiple: false,
    description: 'The destination for the output'
  },
  {
    name: 'db_user',
    type: String,
    multiple: false,
    description: 'username for db'
  },
  {
    name: 'db_pass',
    type: String,
    multiple: false,
    description: 'password for db'

  }
]

const options = commandLineArgs(optionDefinitions)

if (options.help) {
  const usage = commandLineUsage([{
      header: 'Typical Example',
      content: 'A simple example demonstrating typical usage.'
    },
    {
      header: 'Options',
      optionList: optionDefinitions
    },
    {
      content: 'Project home: {underline https://github.com/me/example}'
    }
  ])
  console.log(usage)
} else {
  console.log('options:', options)
}

// Retrieve the first argument
var myLibrary = require('../lib/index.js');
if (!options.dest) throw new Error('please provide the --dest flag');

myLibrary.createApi(options);