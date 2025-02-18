const pluginHandler = require('./pluginHandler.js');
const util = require('util');

const handleCommand = function(text, m, sock, prefix, sleep) {
try {
  if (!text.startsWith(prefix)) return;
  const args = text.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const plugins = pluginHandler.getPlugins();
  for (const plugin of plugins) {
    if (plugin.hidden) continue;
    if (plugin.command.includes(command)) {
      plugin.execution({ sock, m, args, prefix, sleep });
      break;
    }
  }
  } catch(e) {
  return;
 }
};

module.exports = { handleCommand };