/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

console.clear()
require('../system/config')
require('../system/gear')

const {
    default: makeWASocket,
    generateWAMessage,
    makeCacheableSignalKeyStore,
    getAggregateVotesInPollMessage,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode,
    proto,
    getContentType,
    downloadContentFromMessage,
    fetchLatestWaWebVersion
} = require("@adiwajshing/baileys");
const fs = require("fs");
const chalk = require("chalk")
const cfont = require('cfonts')
const pino = require("pino");
const path = require('path')
const lolcatjs = require('lolcatjs')
const NodeCache = require("node-cache");
const qrcode = require('qrcode-terminal');
const fetch = require("node-fetch")
const FileType = require('file-type')
const {
    options,
    logger,
    store
} = require('../sockets.js');
const {
    exec
} = require('child_process');
const _ = require('lodash')
const {
    Boom
} = require("@hapi/boom");
const PhoneNumber = require("awesome-phonenumber");
const readline = require("readline");
const {
    color,
    getBuffer,
} = require("../simple.js")
const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid
} = require('../exif.js')
const {
    smsg,
    tocase,
    saver,
    pollup
} = require("../callback")
const {
    toAudio,
    toPTT,
    toVideo
} = require('../converter.js')
const {
    connectted,
    verifing,
    tester
} = require("../print.js")

const process = require('process');
const toMs = require('ms');
const moment = require("moment-timezone")
const os = require('os');
const speed = require('performance-now')
const checkDiskSpace = require('check-disk-space').default;
const yargs = require('yargs/yargs')
const pathcer = require("../connect")
const {
    bytesToSize,
    checkBandwidth,
    formatSize,
    jsonformat,
    nganuin,
    runtime,
    shorturl,
    formatp,
    getGroupAdmins,
    formatDate,
    getTime,
    isUrl,
    await,
    clockString,
    msToDate,
    sort,
    toNumber,
    enumGetKey,
    fetchJson,
    json,
    delay,
    format,
    logic,
    generateProfilePicture,
    parseMention,
    getRandom,
    fetchBuffer,
    buffergif,
    totalcase
} = require('../simple')
const opts = yargs(process.argv.slice(2)).exitProcess(false).parse();
const dbPath = './lib/database/database.json';
const low = require('../lowdb');
const mongoDB = require('../mongoDB');
const chek = require("../continue/checker.js")
const {
    Low,
    JSONFile
} = low;

let usePairingCode = false
let db;

if (urldb !== '') {
    db = new mongoDB(urldb);
} else {
    console.log("\nTerkoneksi Ke database lokal.")
    db = new JSONFile(dbPath);
}

/* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(db);
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise((resolve) => setInterval(function() {
        (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null)
    }, 1 * 1000));
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

process.on('uncaughtException', console.error);

global.loadDatabase();
if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write()
}, 30 * 1000)

function createTmpFolder() {
    const folderName = "tmp";
    if (!fs.existsSync(folderName)) {
        console.log("Folder tmp telah di buat..")
        fs.mkdirSync(folderName);
    } else { console.log("Folder tmp sudah di buat..") }
}

createTmpFolder();

setInterval(async () => {
    await exec("rm -rf ../../tmp/*")
  }, 60 * 60 * 1000)

/* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, resolve)
    })
};
const useMobile = process.argv.includes("--mobile")
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const {
    version,
    isLatest
} = fetchLatestBaileysVersion();
const msgRetryCounterCache = new NodeCache();
const sesin = "./lib/system/session"
const credsExist = fs.existsSync(sesin + '/creds.json');
const {
    sockets
} = require("../sockets");
console.log(chalk.black.bgWhite("[ QUICK TEST ]\n")) 
console.log("Mengecek ffmpeg dan package lain...")

/* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

async function startBotz() {
await chek._quickTest()
  .then(() => console.log('Selesai, Semua package di cek..'))
  .catch(console.error)
 await chek.version()
 
    if (!credsExist) {
        const optionauth = await question(chalk.magenta.bold(selectione));
        usePairingCode = optionauth.trim() === '2';
    }

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sesin);
    const config = Object.assign(sockets(usePairingCode, useMobile), {
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
    });
    const simple = require('../simple')
    const ptz = await simple.makeWASocket(config)

    /* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

    if (!ptz.authState.creds.registered && usePairingCode) {
        verifing("pairing")
        const phoneNumber = await question("     ");
        const code = await ptz.requestPairingCode(phoneNumber.replace(/[-+ ]/g, ''))
        console.log(chalk.magenta.bold(`${chalk.white.bold("Output Pairing code :")} -[ ${chalk.white.bold(code)} ]-`));
    }

    store.bind(ptz.ev);
    ptz.ev.on('messages.update', async (chatUpdate) => {
        pollup(chatUpdate, store, ptz)
    })
    ptz.ev.on('connection.update', async (update) => {
        pathcer.connection(update, startBotz, ptz, usePairingCode)
    });
    ptz.ev.on('contacts.update', (update) => {
        saver(update, store, ptz)
    })
    ptz.ev.on("messages.upsert", async (chatUpdate) => {
    if (chatUpdate.type === 'notify') {
        await new Promise(resolve => setTimeout(resolve, 500));
        tocase(chatUpdate, store, ptz);
    } else {
        tocase(chatUpdate, store, ptz);
    }
    });
    ptz.ev.on("creds.update", saveCreds);

    return ptz;

    /* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

}

startBotz()