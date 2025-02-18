const Coordinator = {
  standart: 3000,
  fast: 1000,
  heavy: 12000,
  level: 'silent'
};

const FromID = {
  status: 'status@broadcast',
  s: '@s.whatsapp.net',
  g: '@g.us',
  lid: '@lid'
};

const Events = {
  CredsUpdate: 'creds.update',
  MessagesUpsert: 'messages.upsert',
  ConnectionUpdate: 'connection.update'
};

module.exports = {
  Coordinator,
  FromID,
  Events
}