const fs = require('fs');
const chalk = require('chalk');
const apiConfig = require('../config/api_structure.config.js');

const createApi = (options) => {
	console.log(options);
	options = options || {};
	const dir = options.dest || './';
	fs.exists(dir, pathDoesExist => {
		if (pathDoesExist) {
			createStructure(apiConfig.structure, dir, options, 0);
		} else {
			console.log(chalk.yellow('PATH DOES NOT EXIST - CREATING ' + dir));
			fs.mkdir(dir, () => createStructure(apiConfig.structure, dir, options, 0))
		}
	});
}

function createStructure(config, dir, options, iterator) {
	// console.log(chalk.yellow('PATH EXISTS - using ' + dir));
	let item = config[iterator];

	console.log(iterator, config.length);
	if (iterator === config.length) return;
	// config.forEach(item => {
	if (item.type === 'folder') fs.mkdir(dir + '/' + item.path, (err) => {
		if (err) {
			console.log(chalk.red('ERROR: ' + err));
		} else {
			console.log(chalk.green('SUCCESS: ' + item.path));
			createStructure(config, dir, options, ++iterator);
		}

	});
	if (item.type === 'file') {
		for (const k in options) {
			if (options.hasOwnProperty(k)) {
				const element = options[k];
				item.content.replace(`{{${element}}}`, element);
			}
		}

		fs.writeFile(dir + '/' + item.path, item.content || '', (err) => {
			if (err) {
				console.log(chalk.red('ERROR: ' + err));
			} else {
				console.log(chalk.green('SUCCESS: ' + item.path));
				createStructure(config, dir, options, ++iterator);
			}
		});
	}
	// });
}


exports.createApi = createApi;