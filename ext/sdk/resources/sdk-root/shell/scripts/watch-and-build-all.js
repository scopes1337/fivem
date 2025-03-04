const fs = require('fs');
const os = require('os');
const path = require('path');
const concurrently = require('concurrently');

const hostname = (process.argv.find((arg) => arg.startsWith('--hostname=')) || '').replace('--hostname=', '') || os.hostname();

const personalityTheia = path.join(__dirname, '../../personality-theia');
const personalityTheiaApp = path.join(personalityTheia, 'fxdk-app');
const personalityTheiaGameView = path.join(personalityTheia, 'fxdk-game-view');
const personalityTheiaProject = path.join(personalityTheia, 'fxdk-project');
const personalityTheiaServices = path.join(personalityTheia, 'fxdk-services');

const doesNotExist = async (entryPath) => {
  try {
    await fs.promises.stat(entryPath);
    return false;
  } catch (e) {
    return true;
  }
};

async function prebuild() {
  const appLibPath = path.join(personalityTheiaApp, 'lib');
  const gameViewLibPath = path.join(personalityTheiaGameView, 'lib');
  const projectLibPath = path.join(personalityTheiaProject, 'lib');
  const servicesLibPath = path.join(personalityTheiaServices, 'lib');

  if (await doesNotExist(servicesLibPath)) {
    console.log('Prebuilding fxdk-services');
    await concurrently([{ name: 'theia:fxdk-services:pre-build', command: `yarn --cwd ${personalityTheiaServices} build` }]);
  } else {
    console.log('Skipping fxdk-services prebuild');
  }

  if (await doesNotExist(gameViewLibPath)) {
    console.log('Prebuilding fxdk-game-view');
    await concurrently([{ name: 'theia:fxdk-game-view:pre-build', command: `yarn --cwd ${personalityTheiaGameView} build` }]);
  } else {
    console.log('Skipping fxdk-game-view prebuild');
  }

  if (await doesNotExist(projectLibPath)) {
    console.log('Prebuilding fxdk-project');
    await concurrently([{ name: 'theia:fxdk-project:pre-build', command: `yarn --cwd ${personalityTheiaProject} build` }]);
  } else {
    console.log('Skipping fxdk-project prebuild');
  }

  if (await doesNotExist(appLibPath)) {
    console.log('Prebuilding fxdk-app');
    await concurrently([{ name: 'theia:fxdk-app:pre-build', command: `yarn --cwd ${personalityTheiaApp} build` }]);
  } else {
    console.log('Skipping fxdk-app prebuild');
  }
}

function start() {
  return concurrently([
    { name: 'theia:fxdk-services:watch', command: `yarn --cwd ${personalityTheiaServices} watch` },
    { name: 'theia:fxdk-game-view:watch', command: `yarn --cwd ${personalityTheiaGameView} watch` },
    { name: 'theia:fxdk-project:watch', command: `yarn --cwd ${personalityTheiaProject} watch` },
    { name: 'theia:fxdk-app:watch', command: `yarn --cwd ${personalityTheiaApp} watch` },
    { name: 'shell:server:watch', command: `yarn --cwd ../ watch:server` },
    { name: 'shell:client:watch', command: `yarn --cwd ../ watch:client` },
    {
      name: 'theia:fxdk-app:start',
      command: `yarn --cwd ${personalityTheiaApp} start --port=3001 --hostname=${hostname}`,
    },
  ]);
}

Promise.resolve()
  .then(prebuild)
  .then(start)
  .catch(() => process.exit(1));
