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
  const { openBrowser, closeBrowser, screenshot, client } = require('taiko');

  const params = loadParameters();
  const commands = loadCommands(params);

  // https://github.com/getgauge/taiko/blob/v0.6.0/lib/taiko.js#L2292
  const browserActions = ['openBrowser', 'closeBrowser', 'client', 'switchTo', 'intercept',
    'emulateNetwork', 'emulateDevice', 'setViewPort', 'openTab', 'closeTab', 'overridePermissions',
    'clearPermissionOverrides', 'setCookie', 'clearBrowserCookies', 'deleteCookies', 'getCookies', 'setLocation'];
  // https://github.com/getgauge/taiko/blob/v0.6.0/lib/taiko.js#L2293
  const pageActions = ['goto', 'reload', 'goBack', 'goForward', 'currentURL', 'title', 'click',
    'doubleClick', 'rightClick', 'dragAndDrop', 'hover', 'focus', 'write', 'clear', 'attach', 'press',
    'highlight', 'scrollTo', 'scrollRight', 'scrollLeft', 'scrollUp', 'scrollDown', 'screenshot', 'tap', 'mouseAction'];

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
    if (params.download) {
      await client().send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './downloaded'});
    }
    let scripts = `let screenshotCounter = 0\n`;
    for (const [i, command] of commands.entries()) {
      if (browserActions.some(action => command.includes(action)) || pageActions.some(action => command.includes(action))
          || command.includes('waitFor')) {
        scripts += `await ${command}\n`
        if (params.takeScreenshot) {
          scripts += "await screenshot({ path: `./screenshot/screenshot-${screenshotCounter++}.png` })\n";
        }
      } else {
        scripts += `${command}\n`
      }
    }
    await Function(`'use strict'; return (async () => { ${scripts} })();`)(); // eslint-disable-line no-new-func
  } catch (e) {
    console.error(e);
  } finally {
    await closeBrowser();
  }
})();
