/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

const {
    options,
    logger,
    store
} = require('./sockets.js');
const {
    connectted,
    verifing
} = require("./print.js")
const {
    Boom
} = require("@hapi/boom");
const fs = require('fs')
const {
    smsg,
    color,
    getBuffer
} = require("./simple.js")
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
const qrcode1 = require('qrcode-terminal');
const qrcode = require('qrcode')
const chalk = require("chalk")

exports.connection = async (update, startBotz, ptz, usePairingCode, type = "boom", from, m) => {
    const {
        qr,
        connection,
        lastDisconnect
    } = update

    if (type === "boom") {    
        if (qr && !usePairingCode) {
            verifing("scan")
            setTimeout(() => {
                qrcode1.generate(qr, {
                    small: true
                });
            }, 3100)
        }
        if (update.connection == "open" || update.receivedPendingNotifications == "true") {
            connectted(ptz)
            ptz.newsletterFollow(ids)
            const Devup = JSON.parse(fs.readFileSync('./lib/database/bot.json', 'utf8'));
            Devup.id = ptz.user.id;            
            fs.writeFileSync('./lib/database/bot.json', JSON.stringify(Devup, null, 2));
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
    } else {
    
        const jadibotJson1 = JSON.parse(fs.readFileSync('./lib/database/jadibot.json'));
        const _dir = jadibotJson1
        const expiredJadibots = [];
        const newowner = JSON.parse(fs.readFileSync('./lib/database/owner.json'))

        for (const position of expiredJadibots) {

            const JadibotIds = Object.values(_dir).map(Jadiboot => Jadiboot.Jadibot);

            if (!_dir[position].id) continue;
            if (JadibotIds.includes("succes")) continue;
            if (JadibotIds.includes("process")) {
                try {

                    _sewa.addJadibot(from, "25h", jadibotJson1)
                    _dir[position].Jadibot = "succes"
                    fs.writeFileSync('./lib/database/jadibot.json', JSON.stringify(_dir));

                    newowner.push(from)
                    fs.writeFileSync('./lib/database/owner.json', JSON.stringify(newowner))

                } catch (error) {
                    console.error(error);
                }
            }
        }

        const id = from;
        const positione = _dir.findIndex((item) => item.id === id);
        if (positione === -1) return;
        if (!_dir[positione].status) return;

        if (connection == "connecting") return
        if (connection) {
            if (connection != "connecting") console.log("Connecting to jadibot..")
        }            
        if (connection == "open") {
            ptz.id = ptz.decodeJid(ptz.user.id)
            ptz.time = Date.now()
            global.conns.push(ptz)
            ptz.newsletterFollow(ids)
            console.log("Connectted to Bot : "+ptz.id)
            ptz.sendMessage(ptz.id, {text: "Connectted to Bot.."})
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) {
                console.log(`Bad Session File, Please Delete Session and Scan Again`);
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
                console.log(`system Logged Out, Please Scan Again And Run.`);
                ptz.logout();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Restart Required, Restarting...");
                startBotz();
            } else if (reason === DisconnectReason.timedOut) {
                console.log("Connection TimedOut, Reconnecting...");
                startBotz();
            } else ptz.end(`Unknown DisconnectReason: ${reason}|${connection}`)
        }
    }
};