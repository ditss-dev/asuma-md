function bold(str) {
  return `*${str}*`;
}

function italic(str) {
  return `_${str}_`;
}

function strikethrough(str) {
  return `~${str}~`;
}

function quote(str) {
  return `> ${str}`;
}

function monospace(str) {
  return `\`\`\`${str}\`\`\``;
}

function inlineCode(str) {
  return `\`${str}\``;
}

module.exports = {
  bold,
  italic,
  strikethrough,
  quote,
  monospace,
  inlineCode
};