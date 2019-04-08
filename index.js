/* eslint-disable semi */

const loadParameters = function () {
  const separator = process.argv.indexOf('--');
  if (separator !== -1) {
    const params = JSON.parse(process.argv[separator + 1]);
    for (const key in params) {
      global[key] = params[key];
    }
    return params;
  } else {
    return {};
  }
};

const loadCommands = function (params) {
  const fs = require('fs');

  let path;
  if (params['taikofile']) {
    path = params['taikofile'];
  } else if (fs.existsSync('./Taikofile')) {
    path = './Taikofile';
  } else {
    path = '/dev/stdin';
  }

  return fs.readFileSync(path, 'utf8').toString().split('\n').filter((line) => {
    const command = line.trim();
    if (command === '' || command.startsWith('#')) {
      return false;
    } else {
      return true;
    }
  });
};

const printEnvironments = function (params, commands) {
  console.log('Parameters:');
  for (const key in params) {
    console.log(`  ${key}: ${params[key]}`);
  }

  console.log('Commands:');
  for (const command of commands) {
    console.log(`  ${command}`);
  }

  console.log('Results:');
};

(async function () {
  const { openBrowser, closeBrowser, screenshot } = require('taiko');

  const params = loadParameters();
  const commands = loadCommands(params);

  printEnvironments(params, commands);

  try {
    await openBrowser({
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote'
      ]
    });

    for (const [i, command] of commands.entries()) {
      await Function(`'use strict'; return ${command};`)(); // eslint-disable-line no-new-func
      if (params.screenshot) {
        await screenshot({ path: `./screenshot/screenshot-${i.toString().padStart(3, '0')}.png` });
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await closeBrowser();
  }
})();
