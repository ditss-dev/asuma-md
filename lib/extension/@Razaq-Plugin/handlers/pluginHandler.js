const fs = require('fs');
const path = require('path');

const plugins = [];

exports.initPlugins = function (pluginDir) {
  fs.readdirSync(pluginDir).forEach(file => {
    const filePath = path.join(pluginDir, file);
    loadPlugin(filePath);
    fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
        reloadPlugin(filePath);
      }
    });
  });
};

function loadPlugin(filePath) {
  try {
    const plugin = require(filePath);
    plugins.push(plugin);
  } catch (err) {
    console.error(`Failed to load plugin from ${filePath}:`, err.message);
  }
}

function reloadPlugin(filePath) {
  try {
    delete require.cache[require.resolve(filePath)];
    const updatedPlugin = require(filePath);
    const index = plugins.findIndex(p => p.name === updatedPlugin.name);
    if (index !== -1) {
      plugins[index] = updatedPlugin;
    } else {
      plugins.push(updatedPlugin);
    }
  } catch (err) {
    console.error(`Failed to reload plugin from ${filePath}:`, err.message);
  }
}

exports.getPlugins = function () {
  return plugins;
};
