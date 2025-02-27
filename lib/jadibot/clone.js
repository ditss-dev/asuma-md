/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

const {
    modul
} = require('./module');
const {
    baileys,
    boom,
    chalk,
    fs,
    figlet,
    FileType,
    process,
    PhoneNumber
} = modul;
const {
    Boom
} = boom
const path = require('path');
const {
    default: makeWaSocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    generateWAMessage,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    jidDecode,
    proto,
    makeCacheableSignalKeyStore,
    getAggregateVotesInPollMessage
} = baileys
const log = (pino = require("pino"));
const qrcode = require('qrcode');
const rimraf = require("rimraf");
let Pino = require("pino")
const X = "`"
const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid
} = require('../exif')
const {
    isUrl,
    generateMessageTag,
    getBuffer,
    getSizeMedia,
    fetchJson,
    await,
    sleep,
    reSize
} = require('../simple')
const {
    sockets,
    logger,
    store
} = require('../sockets.js');
const {
    smsg,
    tocase,
    pollup,
    saver
} = require("../callback")
const pathcer = require("../connect")

let NodeCache = require("node-cache")
let msgRetryCounterCache = new NodeCache()

if (global.conns instanceof Array) console.log()
else global.conns = []

const jadibot = async (ptz, text, m, from, type) => {

    /* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

    const dbPath = './lib/database/database.json';
    const low = require('../../lib/lowdb');
    const {
        Low,
        JSONFile
    } = low;
    const mongoDB = require('../../lib/mongoDB');
    let _ = require("lodash")
    let db = new JSONFile(dbPath);

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

    global.loadDatabase();
    process.on('uncaughtException', console.error);

    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write()
    }, 30 * 1000)

    /* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

    const {
        sendImage,
        sendMessage,
        reply3
    } = ptz;
    const {
        sender
    } = m;
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(path.join(__dirname, `../jadibot/session/${text}`), log({
        level: "silent"
    }));
    const usePairingCode = type === "pairing" ? true : false;

    /* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

    try {
        async function startBotz() {

            const useMobile = process.argv.includes("--mobile")
            const config = Object.assign(sockets(usePairingCode, useMobile), {
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, logger),
                },
            });
            const simple = require('../simple')
            const ptz = await simple.makeWASocket(config)

            /* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

            if (type === "pairing") {
                if (!ptz.authState.creds.registered) {
                    setTimeout(async () => {
                        let phoneNumber = `${text}`
                        console.log(phoneNumber)
                        let code = await ptz.requestPairingCode(phoneNumber)
                        let hasilcode = code?.match(/.{1,4}/g)?.join("-") || code
                        reply3(from, `*Code: \`[ ${hasilcode} ]\`*\n\nJika Code Error *undefined* ketik *.repses-jadibot* , verif code untuk jadibot sementara, kamu dapat menambah waktu dari owner atau dari bot ini.`, m)
                    }, 3000)
                }
            }

            store.bind(ptz.ev);
            ptz.ev.on('messages.update', async (chatUpdate) => {
                pollup(chatUpdate, store, ptz)
            })
            ptz.ev.on('connection.update', async (update) => {
                if (type === "scan") {
                    console.log(update)
                    const qrconvert = await qrcode.toDataURL(update.qr, {
                        scale: 8
                    })
                    if (update.qr) await sendImage(from, qrconvert, 'Silahkan *scan* dan *verif qr di atas* ini untuk jadibot sementara, kamu dapat menambah waktu dari owner atau dari bot ini.', m);
                }
                pathcer.connection(update, startBotz, ptz, usePairingCode, type, from, m)
            });
            ptz.ev.on('contacts.update', (update) => {
                saver(update, store, ptz)
            })
            ptz.ev.on("messages.upsert", async (chatUpdate) => {
                if (chatUpdate.type === 'notify') {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    tocase(chatUpdate, store, ptz);
                } else {
                    tocase(chatUpdate, store, ptz)
                }
            });
            ptz.ev.on('messages.update', async (chatUpdate) => {
                pollup(chatUpdate, store, ptz)
            })
            ptz.ev.on("creds.update", saveCreds);

            /* ━━━━━━━━━[ --------- ]━━━━━━━━━ */

        }
        startBotz()
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    jadibot,
    conns
}