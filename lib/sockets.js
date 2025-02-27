/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

const pino = require("pino");
const NodeCache = require("node-cache");
const { makeInMemoryStore, jidNormalizedUser } = require("@adiwajshing/baileys");

const logger = pino({ level: "silent", stream: "store" }).child({ level: "silent" });
const store = makeInMemoryStore(logger);

function sockets(usePairingCode, useMobile) {
  return {
    defaultQueryTimeoutMs: undefined,
    emitOwnEvents: true,
    fireInitQueries: true,
    mobile: useMobile,
    logger: logger,
    printQRInTerminal: !usePairingCode,
    isLatest: true,
    msgRetryCounterCache: new NodeCache(),
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    browser: usePairingCode ? ["Ubuntu", "Chrome", "20.0.04"] : ["Gumdramon Md", "Chrome", "3.0.0"],
    getMessage: async (key) => {
        if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg.message;
        }
        return { conversation: "Uwoah !" };
    },
    patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                           ...message,
                       },
                   },
               };
           }
       return message;
    },
  };
}

module.exports = { sockets, logger, store };