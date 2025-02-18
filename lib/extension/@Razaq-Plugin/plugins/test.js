module.exports = {
  name: 'Test Command',
  command: ['hika'],
  category: 'Utility',
  description: 'Command to test the bot',
  args: [],
  execution: function({ m, args, prefix, sleep, sock }) {
    m.reply('respon pake plugin rojak 😹' )
  },
  hidden: false,
};

