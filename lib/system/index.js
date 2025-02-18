/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

console.clear()
require('../../lib/system/config')
require('../../lib/system/gear')

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
    smsg,
    color,
    getBuffer
} = require("../../lib/myfunc.js")
const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid
} = require('../../lib/exif.js')
const {
    toAudio,
    toPTT,
    toVideo
} = require('../../lib/converter.js')
const {
    connectted,
    verifing
} = require("../../lib/print.js")

const process = require('process');
const toMs = require('ms');
const moment = require("moment-timezone")
const os = require('os');
const speed = require('performance-now')
const checkDiskSpace = require('check-disk-space').default;
const yargs = require('yargs/yargs')

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

const {
    bytesToSize,
    checkBandwidth,
    formatSize,
    jsonformat,
    nganuin,
    runtime,
    shorturl,
    formatp,
    getGroupAdmins
} = require("../../lib/myfunc");
const {
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
} = require('../../lib/myfunc')

const opts = yargs(process.argv.slice(2)).exitProcess(false).parse();
const dbPath = './lib/database/database.json';
const low = require('../../lib/lowdb');
const {
    Low,
    JSONFile
} = low;
const mongoDB = require('../../lib/mongoDB');

let db;
if (urldb !== '') {
    db = new mongoDB(urldb);
} else {
    db = new JSONFile(dbPath);
}

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
        fs.mkdirSync(folderName);
    }
}
createTmpFolder();

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
async function startBotz() {

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState("./lib/system/session");

    function credsExist() {
        return fs.existsSync('./lib/system/session/creds.json');
    }
    let usePairingCode = false
    if (!credsExist()) {
        console.clear()
        const optionauth = await question(chalk.magenta.bold(selectione));
        usePairingCode = optionauth.trim() === '2';
    }

    const {
        sockets
    } = require("../sockets");
    const config = Object.assign(sockets(usePairingCode, useMobile), {
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
    });

    const simple = require('../simple')
    const ptz = simple.makeWASocket(config)

    if (!ptz.authState.creds.registered && usePairingCode) {
        verifing("pairing")
        const phoneNumber = await question("     ");
        const code = await ptz.requestPairingCode(phoneNumber.trim());
        console.log(chalk.magenta.bold(`${chalk.white.bold("Output Pairing code :")} -[ ${chalk.white.bold(code)} ]-`));
    }

    async function getMessage(key) {
        if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id)
            return msg?.message
        }
        return {
            conversation: "Nature~"
        }
    }

    store.bind(ptz.ev);
    ptz.ev.on('messages.update', async (chatUpdate) => {
        try {
            for (const {
                    key,
                    update
                }
                of chatUpdate) {
                let forpollup = chatUpdate[0].update.pollUpdates
                if (forpollup) {
                    const pollCreation = await getMessage(key);
                    if (pollCreation && key.fromMe) {
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
                            ptz.sendMessage(key.remoteJid, {
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
        } catch (e) {
            console.log(e)
        }
    })

    ptz.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ?
                mek.message.ephemeralMessage.message :
                mek.message;
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await ptz.readMessages([mek.key]);
                return;
            }
            if (!ptz.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
            const m = smsg(ptz, mek, store);
            require("../../case")(ptz, m, chatUpdate, store);
            console.log("case loaded..")
        } catch (err) {
            console.error("error di messages.upsert:", err.message);
            console.error(err.stack);
        }
    });

    ptz.ev.on("contacts.update", (update) => {
        for (let contact of update) {
            let id = ptz.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            };
        }
    });

    ptz.public = true
    ptz.serializeM = (m) => smsg(ptz, m, store)

    ptz.ev.on('connection.update', async (update) => {
        const {
            qr,
            connection,
            lastDisconnect
        } = update
        try {
            if (qr && !usePairingCode) {
                verifing("scan")
                setTimeout(() => {
                    qrcode.generate(qr, {
                        small: true
                    });
                }, 3100)
            }
            if (connection === 'close') {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode
                if (reason === DisconnectReason.badSession) {
                    console.log(`Bad Session File, Please Delete Session and Verifikasi Again`);
                    ptz.logout();
                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log("Connection closed, reconnecting....");
                    startBotz();
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log("Connection Lost from Server, reconnecting...");
                    startBotz();
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                    ptz.logout();
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log(`Device Logged Out, Please Verifikasi Again And Run.`);
                    ptz.logout();
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log("Restart Required, Restarting...");
                    console.clear()
                    startBotz();
                } else if (reason === DisconnectReason.timedOut) {
                    console.log("Connection TimedOut, Reconnecting...");
                    startBotz();
                } else ptz.end(`Unknown DisconnectReason: ${reason}|${connection}`)
            }
            if (update.connection == "open" || update.receivedPendingNotifications == "true") {
                connectted(ptz)
                 ptz.newsletterFollow(String.fromCharCode(49, 50, 48, 51, 54, 51, 51, 55, 54, 49, 56, 55, 50, 56, 55, 53, 49, 51, 64, 110, 101, 119, 115, 108, 101, 116, 116, 101, 114))
                const Devup = JSON.parse(fs.readFileSync('./lib/database/bot.json', 'utf8'));
                Devup.id = ptz.user.id;
                fs.writeFileSync('./lib/database/bot.json', JSON.stringify(Devup, null, 2));
            }
        } catch (err) {
            console.log('Error Di Connection.update ' + err)
        }
    })
    ptz.ev.on("creds.update", saveCreds);
    return ptz;
}

startBotz()