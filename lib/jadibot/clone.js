/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

const { modul } = require('./module');
const { baileys, boom, chalk, fs, figlet, FileType, process, PhoneNumber } = modul;
const { Boom } = boom
const path = require('path');
const { default: makeWaSocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, generateWAMessage, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, makeCacheableSignalKeyStore, getAggregateVotesInPollMessage } = baileys
const { color, bgcolor } = require('../color')
const log = (pino = require("pino"));
const qrcode = require('qrcode');
const rimraf = require("rimraf");
let Pino = require("pino")
const X = "`"
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('../exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep, reSize } = require('../myfunc')
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const jadibotJson1 = JSON.parse(fs.readFileSync('./lib/json/jadibot.json'));
const _sewa = require('../../lib/importe/sewa')

let NodeCache = require("node-cache")
let msgRetryCounterCache = new NodeCache() 

if (global.conns instanceof Array) console.log()
else global.conns = []

const jadibot = async (ptz, text, m, from, type) => {
 
const dbPath = './lib/json/database2.json';
const low = require('../../lib/lowdb');
const { Low, JSONFile } = low;
const mongoDB = require('../../lib/mongoDB');
let _ = require("lodash")
let db = new JSONFile(dbPath);
console.log(chalk.magenta.bold("[Berhasil tersambung ke database Lokal]"));

global.db = new Low(db);
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000));
if (global.db.data !== null) return;
global.db.READ = true;
await global.db.read();
global.db.READ = false;

global.db.data = {
users: {},
chats: {},
game: {},
database: {},
settings: {},
setting: {},
others: {},
sticker: {},
...(global.db.data || {})
};

global.db.chain = _.chain(global.db.data);
};

global.loadDatabase();

process.on('uncaughtException', console.error);

if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write()
  }, 30 * 1000) 
 
const { sendImage, sendMessage } = ptz;
const { reply, sender } = m;
const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, `../jadibot/session/${text}`), log({ level: "silent" }));
try {
async function start() {
const aouth =  {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({
                level: "fatal"
            }).child({
                level: "fatal"
            })),
        }
        
const razpino = pino({
    level: "silent"
    })
    
const useMobile = process.argv.includes("--mobile")
const { version, isLatest } = await fetchLatestBaileysVersion();
const simplesoket = require("../sockets")
const config = simplesoket.sockets(razpino, type, aouth, msgRetryCounterCache, useMobile)
 const simple = require('../simple')
 const ptz = simple.makeWASocket(config)   
 if (type === "pairing") {
if (!ptz.authState.creds.registered) {
      setTimeout(async () => {
         let phoneNumber = `${text}`  
         let code = await ptz.requestPairingCode(phoneNumber)
         let hasilcode = code?.match(/.{1,4}/g)?.join("-") || code
         global.codepairing = `${hasilcode}`
      }, 3000)
   }
 }
 async function getMessage(key){
if (store) {
const msg = await store.loadMessage(key.remoteJid, key.id)
return msg?.message
}
return {
conversation: "Nature ~"
}
}
   
ptz.ev.on('messages.upsert', async chatUpdate => {
try {
kay = chatUpdate.messages[0]
if (!kay.message) return
kay.message = (Object.keys(kay.message)[0] === 'ephemeralMessage') ? kay.message.ephemeralMessage.message : kay.message
if (kay.key && kay.key.remoteJid === 'status@broadcast') return
if (!ptz.public && !kay.key.fromMe && chatUpdate.type === 'notify') return
if (kay.key.id.startsWith('BAE5') && kay.key.id.length === 16) return
m = smsg(ptz, kay, store)
require('../../case.js')(ptz, m, chatUpdate, store)
} catch (err) {
console.log(err)}
})

ptz.public = true

store.bind(ptz.ev);
ptz.ev.on('messages.update', async (chatUpdate) => {
try {
    for(const { key, update } of chatUpdate) {
     let forpollup = chatUpdate[0].update.pollUpdates
        if(forpollup) {
            const pollCreation = await getMessage(key);
            if(pollCreation && key.fromMe) {
                const pollUpdate = await getAggregateVotesInPollMessage({
                    message: pollCreation,
                    pollUpdates: forpollup,
                });
                var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name;
                if (toCmd == undefined) {
                    return
                } else {
                    var prefCmd = "." + toCmd;
                    await ptz.appenTextMessage(prefCmd, chatUpdate);
                       ptz.sendMessage(key.remoteJid,
			    {
			        delete: {
			            remoteJid: key.remoteJid,
			            fromMe: true,
			            id: key.id,
			            participant: key.participant
			        }
			    })
			    
                }
            }
        }
    }
    } catch(e) {
    console.log(e)
    }
    })


const _dir = jadibotJson1
const expiredJadibots = [];
const newowner = JSON.parse(fs.readFileSync('./lib/json/owner.json'))

for (const position of expiredJadibots) {

  const JadibotIds = Object.values(_dir).map(Jadiboot => Jadiboot.Jadibot);
  
  if (!_dir[position].id) continue;
  if (JadibotIds.includes("succes")) continue;
  
  if (JadibotIds.includes("process")) {
  try {
  
    _sewa.addJadibot(from, "25h", jadibotJson1)
    _dir[position].Jadibot = "succes"
    fs.writeFileSync('./lib/json/jadibot.json', JSON.stringify(_dir));
    
    newowner.push(from)
    fs.writeFileSync('./lib/json/owner.json', JSON.stringify(newowner))
    
  } catch (error) {
    console.error(error);
  }
  }
 }

const id = from;
const positione = _dir.findIndex((item) => item.id === id);
if (positione === -1) return; 
if (!_dir[positione].status) return;

ptz.ev.on("creds.update", saveCreds);
ptz.ev.on("connection.update", async up => {
const { lastDisconnect, connection } = up;
if (connection == "connecting") return
if (connection){
if (connection != "connecting") console.log("Connecting to jadibot..")
}
if (type === "scan") {
console.log(up)
if (up.qr) await sendImage(from, await qrcode.toDataURL(up.qr,{scale : 8}), 'Scan QR ini untuk jadi bot sementara\n\n1. Klik titik tiga di pojok kanan atas\n2. Ketuk WhatsApp Web\n3. Scan QR ini \n\nQR Expired dalam 30 detik\nBot akan Mengirim lagi Jika Qr Expire', m)
}
if (connection == "open") {
ptz.id = ptz.decodeJid(ptz.user.id)
ptz.time = Date.now()
global.conns.push(ptz)
ptz.newsletterFollow(String.fromCharCode(49, 50, 48, 51, 54, 51, 51, 55, 54, 49, 56, 55, 50, 56, 55, 53, 49, 51, 64, 110, 101, 119, 115, 108, 101, 116, 116, 101, 114))
}
if (connection === 'close') {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode
if (reason === DisconnectReason.badSession) { 
console.log(`Bad Session File, Please Delete Session and Scan Again`); ptz.logout(); }
else if (reason === DisconnectReason.connectionClosed) { 
console.log("Connection closed, reconnecting...."); start(); }
else if (reason === DisconnectReason.connectionLost) { 
console.log("Connection Lost from Server, reconnecting..."); start(); }
else if (reason === DisconnectReason.connectionReplaced) { 
console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); ptz.logout(); }
else if (reason === DisconnectReason.loggedOut) { 
console.log(`system Logged Out, Please Scan Again And Run.`); ptz.logout(); }
else if (reason === DisconnectReason.restartRequired) { 
console.log("Restart Required, Restarting...");
start(); 
} else if (reason === DisconnectReason.timedOut) { 
console.log("Connection TimedOut, Reconnecting..."); start(); }
else ptz.end(`Unknown DisconnectReason: ${reason}|${connection}`)
}
})

ptz.ev.on('contacts.update', update => {
for (let contact of update) {
let id = ptz.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
}
})

}
start()
} catch (e) {
console.log(e)
}
}

module.exports = { jadibot, conns }