/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

const {
    default: makeWASocket,
    makeWALegacySocket,
    extractMessageContent,
    makeInMemoryStore,
    proto,
    prepareWAMessageMedia,
    downloadContentFromMessage,
    getBinaryNodeChild,
    jidDecode,
    areJidsSameUser,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    WAMessageStubType,
    WA_DEFAULT_EPHEMERAL,
} = require('@adiwajshing/baileys')
const {
    toAudio,
    toPTT,
    toVideo
} = require('./converter')
const smsg = require("./callback")
const chalk = require('chalk')
const fetch = require("node-fetch")
const FileType = require('file-type')
const PhoneNumber = require('awesome-phonenumber')
const fs = require('fs')
const path = require('path')
let Jimp = require('jimp')
const pino = require('pino')
const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid
} = require('./exif')
const ephemeral = {
    ephemeralExpiration: 8600
}
const {
    sizeFormatter
} = require('human-readable');
const {
    logger,
    store
} = require('./sockets.js');

exports.makeWASocket = (connectionOptions, options = {}) => {
    const ptz = makeWASocket(connectionOptions)

    ptz.loadAllMessages = (messageID) => {
        return Object.entries(ptz.chats)
            .filter(([_, {
                messages
            }]) => typeof messages === 'object')
            .find(([_, {
                    messages
                }]) => Object.entries(messages)
                .find(([k, v]) => (k === messageID || v.key?.id === messageID)))
            ?.[1].messages?.[messageID]
    }

    ptz.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    if (ptz.user && ptz.user.id) ptz.user.jid = ptz.decodeJid(ptz.user.id)
    if (!ptz.chats) ptz.chats = {}

    function updateNameToDb(contacts) {
        if (!contacts) return
        for (const contact of contacts) {
            const id = ptz.decodeJid(contact.id)
            if (!id) continue
            let chats = ptz.chats[id]
            if (!chats) chats = ptz.chats[id] = {
                id
            }
            ptz.chats[id] = {
                ...chats,
                ...({
                    ...contact,
                    id,
                    ...(id.endsWith('@g.us') ? {
                        subject: contact.subject || chats.subject || ''
                    } : {
                        name: contact.notify || chats.name || chats.notify || ''
                    })
                } || {})
            }
        }
    }

    ptz.logger = {
        ...ptz.logger,
        info(...args) {
            console.log(chalk.bold.rgb(57, 183, 16)(`INFO [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.cyan(...args))
        },
        error(...args) {
            console.log(chalk.bold.rgb(247, 38, 33)(`ERROR [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.rgb(255, 38, 0)(...args))
        },
        warn(...args) {
            console.log(chalk.bold.rgb(239, 225, 3)(`WARNING [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.keyword('orange')(...args))
        }
    }

    /**
     * getBuffer hehe
     * @param {fs.PathLike} path
     * @param {Boolean} returnFilename
     */
    ptz.getFile = async (PATH, returnAsFilename) => {
        let res, filename
        const data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        const type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        if (data && returnAsFilename && !filename)(filename = path.join(__dirname, '../../tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
        return {
            res,
            filename,
            ...type,
            data,
            deleteFile() {
                return filename && fs.promises.unlink(filename)
            }
        }
    }


    /**
     * waitEvent
     * @param {Partial<BaileysEventMap>|String} eventName 
     * @param {Boolean} is 
     * @param {Number} maxTries 
     * @returns 
     */
    ptz.waitEvent = (eventName, is = () => true, maxTries = 25) => {
        return new Promise((resolve, reject) => {
            let tries = 0
            let on = (...args) => {
                if (++tries > maxTries) reject('Max tries reached')
                else if (is()) {
                    ptz.ev.off(eventName, on)
                    resolve(...args)
                }
            }
            ptz.ev.on(eventName, on)
        })
    }

    ptz.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    /**
     * 
     * @param {String} text 
     * @returns 
     */
    ptz.filter = (text) => {
        let mati = ["q", "w", "r", "t", "y", "p", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"]
        if (/[aiueo][aiueo]([qwrtypsdfghjklzxcvbnm])?$/i.test(text)) return text.substring(text.length - 1)
        else {
            let res = Array.from(text).filter(v => mati.includes(v))
            let resu = res[res.length - 1]
            for (let huruf of mati) {
                if (text.endsWith(huruf)) {
                    resu = res[res.length - 2]
                }
            }
            let misah = text.split(resu)
            return resu + misah[misah.length - 1]
        }
    }

    /**
     * ms to date
     * @param {String} ms
     */
    ptz.msToDate = (ms) => {
        let days = Math.floor(ms / (24 * 60 * 60 * 1000));
        let daysms = ms % (24 * 60 * 60 * 1000);
        let hours = Math.floor((daysms) / (60 * 60 * 1000));
        let hoursms = ms % (60 * 60 * 1000);
        let minutes = Math.floor((hoursms) / (60 * 1000));
        let minutesms = ms % (60 * 1000);
        let sec = Math.floor((minutesms) / (1000));
        return days + " Hari " + hours + " Jam " + minutes + " Menit";
        // +minutes+":"+sec;
    }

    /**
     * isi
     */
    ptz.rand = async (isi) => {
        return isi[Math.floor(Math.random() * isi.length)]
    }

    /**
     * Send Media All Type 
     * @param {String} jid
     * @param {String|Buffer} path
     * @param {Object} quoted
     * @param {Object} options 
     */
    ptz.sendMedia = async (jid, path, quoted, options = {}) => {
        let {
            ext,
            mime,
            data
        } = await ptz.getFile(path)
        messageType = mime.split("/")[0]
        pase = messageType.replace('application', 'document') || messageType
        return await ptz.sendMessage(jid, {
            [`${pase}`]: data,
            mimetype: mime,
            ...options
        }, {
            quoted
        })
    }

    ptz.adReply = (jid, text, title = '', body = '', buffer, source = '', quoted, options) => {
            let {
                data
            } = ptz.getFile(buffer, true)
            return ptz.sendMessage(jid, {
                text: text,
                contextInfo: {
                    mentionedJid: ptz.parseMention(text),
                    externalAdReply: {
                        showAdAttribution: true,
                        mediaType: 1,
                        title: title,
                        body: body,
                        thumbnailUrl: 'https://telegra.ph/file/dc229854bc5fecf01.jpg',
                        renderLargerThumbnail: true,
                        sourceUrl: source
                    }
                }
            }, {
                quoted: quoted,
                ...options,
                ...ephemeral
            })

            enumerable: true
        },

        /**
         * Send Media/File with Automatic Type Specifier
         * @param {String} jid
         * @param {String|Buffer} path
         * @param {String} filename
         * @param {String} caption
         * @param {proto.WebMessageInfo} quoted
         * @param {Boolean} ptt
         * @param {Object} options
         */
        ptz.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
            let type = await ptz.getFile(path, true)
            let {
                res,
                data: file,
                filename: pathFile
            } = type
            if (res && res.status !== 200 || file.length <= 65536) {
                try {
                    throw {
                        json: JSON.parse(file.toString())
                    }
                } catch (e) {
                    if (e.json) throw e.json
                }
            }
            let opt = {
                filename
            }
            if (quoted) opt.quoted = quoted
            if (!type) options.asDocument = true
            let mtype = '',
                mimetype = type.mime,
                convert
            if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
            else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
            else if (/video/.test(type.mime)) mtype = 'video'
            else if (/audio/.test(type.mime))(
                convert = await (ptt ? toPTT : toAudio)(file, type.ext),
                file = convert.data,
                pathFile = convert.filename,
                mtype = 'audio',
                mimetype = 'audio/ogg; codecs=opus'
            )
            else mtype = 'document'
            if (options.asDocument) mtype = 'document'

            let message = {
                ...options,
                caption,
                ptt,
                [mtype]: {
                    url: pathFile
                },
                mimetype
            }
            let m
            try {
                m = await ptz.sendMessage(jid, message, {
                    ...opt,
                    ...options
                })
            } catch (e) {
                console.error(e)
                m = null
            } finally {
                if (!m) m = await ptz.sendMessage(jid, {
                    ...message,
                    [mtype]: file
                }, {
                    ...opt,
                    ...options
                })
                return m
            }
        }

    ptz.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await ptz.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }

    ptz.sendImageAsStickerso = async (jid, path, options = {}, quoted) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }
        await ptz.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    
    ptz.sendImage = async (jid, path, caption = '', quoted = '', options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await ptz.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
}

    /**
     * Send Contact
     * @param {String} jid 
     * @param {String} number 
     * @param {String} name 
     * @param {Object} quoted 
     * @param {Object} options 
     */
    ptz.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = []
        for (let i of kon) {
            list.push({
                displayName: await ptz.getName(i),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await ptz.getName(i)}\nFN:${await ptz.getName(i)}\nitem1.TEL;waid=${i.split('@')[0]}:${i.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
            })
        }
        ptz.sendMessage(jid, {
            contacts: {
                displayName: `${list.length} Contact`,
                contacts: list
            },
            ...opts
        }, {
            quoted
        })
    }

    ptz.sendList = async (jid, header, footer, separate, buttons, rows, quoted, options) => {
            const inputArray = rows.flat()
            const result = inputArray.reduce((acc, curr, index) => {
                if (index % 2 === 1) {
                    const [title, rowId, description] = curr[0]
                    acc.push({
                        title,
                        rowId,
                        description
                    })
                }
                return acc
            }, [])
            let teks = result
                .map((v, index) => {
                    return `${v.title || ''}\n${v.rowId || ''}\n${v.description || ''}`.trim()
                })
                .filter(v => v)
                .join("\n\n")
            return ptz.sendMessage(jid, {
                ...options,
                text: teks
            }, {
                quoted,
                ...options
            })
        },


        /**
         * Reply to a message
         * @param {String} jid
         * @param {String|Object} text
         * @param {Object} quoted
         * @param {Object} options
         */
        ptz.reply = (jid, text = '', quoted, options) => {
            return Buffer.isBuffer(text) ? ptz.sendFile(jid, text, 'file', '', quoted, false, options) : ptz.sendMessage(jid, {
                ...options,
                text,
                mentions: ptz.parseMention(text)
            }, {
                quoted,
                ...options,
                mentions: ptz.parseMention(text)
            })
        }

    ptz.resize = async (image, width, height) => {
        let oyy = await Jimp.read(image)
        let kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG)
        return kiyomasa
    }

    ptz.fakeReply = (jid, text = '', fakeJid = ptz.user.jid, fakeText = '', fakeGroupJid, options) => {
        return ptz.sendMessage(jid, {
            text: text
        }, {
            ephemeralExpiration: 86400,
            quoted: {
                key: {
                    fromMe: fakeJid == ptz.user.jid,
                    participant: fakeJid,
                    ...(fakeGroupJid ? {
                        remoteJid: fakeGroupJid
                    } : {})
                },
                message: {
                    conversation: fakeText
                },
                ...options
            }
        })
    }
    ptz.reply1 = async (jid, text, quoted, men) => {
        return ptz.sendMessage(jid, {
            text: text,
            jpegThumbnail: await (await fetch(thumbr1)).buffer(),
            mentions: men
        }, {
            quoted: quoted,
            ephemeralExpiration: 86400
        })
    }
    ptz.reply2 = async (jid, text, media, quoted, men) => {
        return ptz.sendMessage(jid, {
            text: text,
            jpegThumbnail: await (await fetch(media)).buffer(),
            mentions: men
        }, {
            quoted: quoted,
            ephemeralExpiration: 8600
        })
    }  
    ptz.reply3 = (jid, prompt = '', quote) => {
      return ptz.sendMessage(jid, {
        text: prompt,
       }, {
       quoted: quote,
       ephemeralExpiration: 86400
      })
    }
    ptz.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    ptz.sendText = (jid, text, quoted = '', options) => ptz.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted
    })

    /**
     * sendGroupV4Invite
     * @param {String} jid 
     * @param {*} participant 
     * @param {String} inviteCode 
     * @param {Number} inviteExpiration 
     * @param {String} groupName 
     * @param {String} caption 
     * @param {*} options 
     * @returns 
     */
    ptz.sendGroupV4Invite = async (jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', options = {}) => {
        let msg = proto.Message.fromObject({
            groupInviteMessage: proto.GroupInviteMessage.fromObject({
                inviteCode,
                inviteExpiration: parseInt(inviteExpiration) || +new Date(new Date + (3 * 86400000)),
                groupJid: jid,
                groupName: groupName ? groupName : this.getName(jid),
                caption
            })
        })
        let message = await this.prepareMessageFromContent(participant, msg, options)
        await this.relayWAMessage(message)
        return message
    }

    /**
     * cMod
     * @param {String} jid 
     * @param {proto.WebMessageInfo} message 
     * @param {String} text 
     * @param {String} sender 
     * @param {*} options 
     * @returns 
     */
    ptz.cMod = (jid, message, text = '', sender = ptz.user.jid, options = {}) => {
        let copy = message.toJSON()
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = false // mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = {
            ...content,
            ...options
        }
        if (copy.participant) sender = copy.participant = sender || copy.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = areJidsSameUser(sender, ptz.user.id) || false
        return proto.WebMessageInfo.fromObject(copy)
    }

    /**
     * Exact Copy Forward
     * @param {String} jid
     * @param {proto.WebMessageInfo} message
     * @param {Boolean|Number} forwardingScore
     * @param {Object} options
     */
    ptz.copyNForward = async (jid, message, forwardingScore = true, options = {}) => {
        let m = generateForwardMessageContent(message, !!forwardingScore)
        let mtype = Object.keys(m)[0]
        if (forwardingScore && typeof forwardingScore == 'number' && forwardingScore > 1) m[mtype].contextInfo.forwardingScore += forwardingScore
        m = generateWAMessageFromContent(jid, m, {
            ...options,
            userJid: ptz.user.id
        })
        await ptz.relayMessage(jid, m.message, {
            messageId: m.key.id,
            additionalAttributes: {
                ...options
            }
        })
        return m
    }

    ptz.loadMessage = ptz.loadMessage || (async (messageID) => {
        return Object.entries(ptz.chats)
            .filter(([_, {
                messages
            }]) => typeof messages === 'object')
            .find(([_, {
                    messages
                }]) => Object.entries(messages)
                .find(([k, v]) => (k === messageID || v.key?.id === messageID)))
            ?.[1].messages?.[messageID]
    })

    /**
     * Download media message
     * @param {Object} m
     * @param {String} type 
     * @param {fs.PathLike|fs.promises.FileHandle} filename
     * @returns {Promise<fs.PathLike|fs.promises.FileHandle|Buffer>}
     */
    ptz.downloadM = async (m, type, saveToFile) => {
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
        const stream = await downloadContentFromMessage(m, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        if (saveToFile) var {
            filename
        } = await ptz.getFile(buffer, true)
        return saveToFile && fs.existsSync(filename) ? filename : buffer
    }

    ptz.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    /**
     * parseMention(s)
     * @param {string} text 
     * @returns {string[]}
     */
    ptz.parseMention = (text = '') => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }
    /**
     * Read message
     * @param {String} jid 
     * @param {String|undefined|null} participant 
     * @param {String} messageID 
     */
    ptz.chatRead = async (jid, participant = ptz.user.jid, messageID) => {
        return await ptz.sendReadReceipt(jid, participant, [messageID])
    }

    ptz.sendStimg = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }
        await ptz.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }

    ptz.sendStvid = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }
        await ptz.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }

    /**
     * Parses string into mentionedJid(s)
     * @param {String} text
     */
    ptz.parseMention = (text = '') => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }

    ptz.sendTextWithMentions = async (jid, text, quoted, options = {}) => ptz.sendMessage(jid, {
        text: text,
        contextInfo: {
            mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net')
        },
        ...options
    }, {
        quoted
    })

    /**
     * Get name from jid
     * @param {String} jid
     * @param {Boolean} withoutContact
     */
    ptz.getName = (jid = '', withoutContact = false) => {
        jid = ptz.decodeJid(jid)
        withoutContact = this.withoutContact || withoutContact
        let v
        if (jid.endsWith('@g.us')) return new Promise(async (resolve) => {
            v = ptz.chats[jid] || {}
            if (!(v.name || v.subject)) v = await ptz.groupMetadata(jid) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = jid === '0@s.whatsapp.net' ? {
                jid,
                vname: 'WhatsApp'
            } : areJidsSameUser(jid, ptz.user.id) ?
            ptz.user :
            (ptz.chats[jid] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    /**
     * to process MessageStubType
     * @param {proto.WebMessageInfo} m 
     */
    ptz.processMessageStubType = async (m) => {
        /**
         * to process MessageStubType
         * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} m 
         */
        if (!m.messageStubType) return
        const chat = ptz.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '')
        if (!chat || chat === 'status@broadcast') return
        const emitGroupUpdate = (update) => {
            ptz.ev.emit('groups.update', [{
                id: chat,
                ...update
            }])
        }
        switch (m.messageStubType) {
            case WAMessageStubType.REVOKE:
            case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
                emitGroupUpdate({
                    revoke: m.messageStubParameters[0]
                })
                break
            case WAMessageStubType.GROUP_CHANGE_ICON:
                emitGroupUpdate({
                    icon: m.messageStubParameters[0]
                })
                break
            default: {
                console.log({
                    messageStubType: m.messageStubType,
                    messageStubParameters: m.messageStubParameters,
                    type: WAMessageStubType[m.messageStubType]
                })
                break
            }
        }
        const isGroup = chat.endsWith('@g.us')
        if (!isGroup) return
        let chats = ptz.chats[chat]
        if (!chats) chats = ptz.chats[chat] = {
            id: chat
        }
        chats.isChats = true
        const metadata = await ptz.groupMetadata(chat).catch(_ => null)
        if (!metadata) return
        chats.subject = metadata.subject
        chats.metadata = metadata
    }
    ptz.insertAllGroup = async () => {
        const groups = await ptz.groupFetchAllParticipating().catch(_ => null) || {}
        for (const group in groups) ptz.chats[group] = {
            ...(ptz.chats[group] || {}),
            id: group,
            subject: groups[group].subject,
            isChats: true,
            metadata: groups[group]
        }
        return ptz.chats
    }

    /**
     * pushMessage
     * @param {proto.WebMessageInfo[]} m 
     */
    ptz.pushMessage = async (m) => {
        /**
         * pushMessage
         * @param {import('@adiwajshing/baileys').proto.WebMessageInfo[]} m 
         */
        if (!m) return
        if (!Array.isArray(m)) m = [m]
        for (const message of m) {
            try {
                if (!message) continue
                if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT) ptz.processMessageStubType(message).catch(console.error)
                const _mtype = Object.keys(message.message || {})
                const mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) ||
                    (_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) ||
                    _mtype[_mtype.length - 1]
                const chat = ptz.decodeJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '')
                if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
                    /**
                     * @type {import('@adiwajshing/baileys').proto.IContextInfo}
                     */
                    let context = message.message[mtype].contextInfo
                    let participant = ptz.decodeJid(context.participant)
                    const remoteJid = ptz.decodeJid(context.remoteJid || participant)
                    /**
                     * @type {import('@adiwajshing/baileys').proto.IMessage}
                     * 
                     */
                    let quoted = message.message[mtype].contextInfo.quotedMessage
                    if ((remoteJid && remoteJid !== 'status@broadcast') && quoted) {
                        let qMtype = Object.keys(quoted)[0]
                        if (qMtype == 'conversation') {
                            quoted.extendedTextMessage = {
                                text: quoted[qMtype]
                            }
                            delete quoted.conversation
                            qMtype = 'extendedTextMessage'
                        }

                        if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {}
                        quoted[qMtype].contextInfo.mentionedJid = context.mentionedJid || quoted[qMtype].contextInfo.mentionedJid || []
                        const isGroup = remoteJid.endsWith('g.us')
                        if (isGroup && !participant) participant = remoteJid
                        const qM = {
                            key: {
                                remoteJid,
                                fromMe: areJidsSameUser(ptz.user.jid, remoteJid),
                                id: context.stanzaId,
                                participant,
                            },
                            message: JSON.parse(JSON.stringify(quoted)),
                            ...(isGroup ? {
                                participant
                            } : {})
                        }
                        let qChats = ptz.chats[participant]
                        if (!qChats) qChats = ptz.chats[participant] = {
                            id: participant,
                            isChats: !isGroup
                        }
                        if (!qChats.messages) qChats.messages = {}
                        if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM
                        let qChatsMessages
                        if ((qChatsMessages = Object.entries(qChats.messages)).length > 40) qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length)) // maybe avoid memory leak
                    }
                }
                if (!chat || chat === 'status@broadcast') continue
                const isGroup = chat.endsWith('@g.us')
                let chats = ptz.chats[chat]
                if (!chats) {
                    if (isGroup) await ptz.insertAllGroup().catch(console.error)
                    chats = ptz.chats[chat] = {
                        id: chat,
                        isChats: true,
                        ...(ptz.chats[chat] || {})
                    }
                }
                let metadata, sender
                if (isGroup) {
                    if (!chats.subject || !chats.metadata) {
                        metadata = await ptz.groupMetadata(chat).catch(_ => ({})) || {}
                        if (!chats.subject) chats.subject = metadata.subject || ''
                        if (!chats.metadata) chats.metadata = metadata
                    }
                    sender = ptz.decodeJid(message.key?.fromMe && ptz.user.id || message.participant || message.key?.participant || chat || '')
                    if (sender !== chat) {
                        let chats = ptz.chats[sender]
                        if (!chats) chats = ptz.chats[sender] = {
                            id: sender
                        }
                        if (!chats.name) chats.name = message.pushName || chats.name || ''
                    }
                } else if (!chats.name) chats.name = message.pushName || chats.name || ''
                if (['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype)) continue
                chats.isChats = true
                if (!chats.messages) chats.messages = {}
                const fromMe = message.key.fromMe || areJidsSameUser(sender || chat, ptz.user.id)
                if (!['protocolMessage'].includes(mtype) && !fromMe && message.messageStubType != WAMessageStubType.CIPHERTEXT && message.message) {
                    delete message.message.messageContextInfo
                    delete message.message.senderKeyDistributionMessage
                    chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2))
                    let chatsMessages
                    if ((chatsMessages = Object.entries(chats.messages)).length > 40) chats.messages = Object.fromEntries(chatsMessages.slice(30, chatsMessages.length))
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    /*
     * Send Polling
     */
    ptz.getFile = async (path) => {
        let res
        let data = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (res = await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : typeof path === 'string' ? path : Buffer.alloc(0)
        if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }

        return {
            res,
            ...type,
            data
        }
    }

    ptz.sendPoll = async (vb, question = '', options = [], selectableCount = 1) => {
        global.waiter = vb
        return ptz.sendMessage(vb, {
        poll: {
            name: question,
            values: options,
            selectableCount: selectableCount
        }
    })
    };

    /*
     * Set auto Bio
     */

    ptz.setBio = async (status) => {
        return await ptz.query({
            tag: 'iq',
            attrs: {
                to: 's.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        })
    }

    /**
     * 
     * @param  {...any} args 
     * @returns 
     */
    ptz.format = (...args) => {
        return util.format(...args)
    }

    /**
     * 
     * @param {String} url 
     * @param {Object} options 
     * @returns 
     */
    ptz.getBuffer = async (url, options) => {
        try {
            options ? options : {}
            const res = await axios({
                method: "get",
                url,
                headers: {
                    'DNT': 1,
                    'Upgrade-Insecure-Request': 1
                },
                ...options,
                responseType: 'arraybuffer'
            })
            return res.data
        } catch (e) {
            console.log(`Error : ${e}`)
        }
    }

    /**
     * Serialize Message, so it easier to manipulate
     * @param {Object} m
     */
    ptz.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    ptz.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }
        await ptz.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }

    ptz.setStatus = (status) => {
        ptz.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        })
        return status
    }

    store.bind(ptz.ev);
    ptz.ev.on('contacts.upsert', updateNameToDb)
    ptz.ev.on('groups.update', updateNameToDb)
    ptz.ev.on('chats.set', async ({
        chats
    }) => {
        for (const {
                id,
                name,
                readOnly
            }
            of chats) {
            id = ptz.decodeJid(id)
            if (!id) continue
            const isGroup = id.endsWith('@g.us')
            let chats = ptz.chats[id]
            if (!chats) chats = ptz.chats[id] = {
                id
            }
            chats.isChats = !readOnly
            if (name) chats[isGroup ? 'subject' : 'name'] = name
            if (isGroup) {
                const metadata = await ptz.groupMetadata(id).catch(_ => null)
                if (!metadata) continue
                chats.subject = name || metadata.subject
                chats.metadata = metadata
            }
        }
    })
    ptz.ev.on('group-participants.update', async function updateParticipantsToDb({
        id,
        participants,
        action
    }) {
        id = ptz.decodeJid(id)
        if (!(id in ptz.chats)) ptz.chats[id] = {
            id
        }
        ptz.chats[id].isChats = true
        const groupMetadata = await ptz.groupMetadata(id).catch(_ => null)
        if (!groupMetadata) return
        ptz.chats[id] = {
            ...ptz.chats[id],
            subject: groupMetadata.subject,
            metadata: groupMetadata
        }
    })

    ptz.ev.on('groups.update', async function groupUpdatePushToDb(groupsUpdates) {
        for (const update of groupsUpdates) {
            const id = ptz.decodeJid(update.id)
            if (!id) continue
            const isGroup = id.endsWith('@g.us')
            if (!isGroup) continue
            let chats = ptz.chats[id]
            if (!chats) chats = ptz.chats[id] = {
                id
            }
            chats.isChats = true
            const metadata = await ptz.groupMetadata(id).catch(_ => null)
            if (!metadata) continue
            chats.subject = metadata.subject
            chats.metadata = metadata
        }
    })
    ptz.ev.on('chats.upsert', async function chatsUpsertPushToDb(chatsUpsert) {
        const {
            id,
            name
        } = chatsUpsert
        if (!id) return
        let chats = ptz.chats[id] = {
            ...ptz.chats[id],
            ...chatsUpsert,
            isChats: true
        }
        const isGroup = id.endsWith('@g.us')
        if (isGroup) {
            const metadata = await ptz.groupMetadata(id).catch(_ => null)
            if (metadata) {
                chats.subject = name || metadata.subject
                chats.metadata = metadata
            }
            const groups = await ptz.groupFetchAllParticipating().catch(_ => ({})) || {}
            for (const group in groups) ptz.chats[group] = {
                id: group,
                subject: groups[group].subject,
                isChats: true,
                metadata: groups[group]
            }
        }
    })
    ptz.ev.on('presence.update', async function presenceUpdatePushToDb({
        id,
        presences
    }) {
        const sender = Object.keys(presences)[0] || id
        const _sender = ptz.decodeJid(sender)
        const presence = presences[sender]['lastKnownPresence'] || 'composing'
        let chats = ptz.chats[_sender]
        if (!chats) chats = ptz.chats[_sender] = {
            id: sender
        }
        chats.presences = presence
        if (id.endsWith('@g.us')) {
            let chats = ptz.chats[id]
            if (!chats) {
                const metadata = await ptz.groupMetadata(id).catch(_ => null)
                if (metadata) chats = ptz.chats[id] = {
                    id,
                    subject: metadata.subject,
                    metadata
                }
            }
            chats.isChats = true
        }
    })

    ptz.public = true
    ptz.serializeM = (m) => {
        return smsg(ptz, m)
    }

    Object.defineProperty(ptz, 'name', {
        value: 'WASocket',
        configurable: true,
    })
    return ptz
}

//    EXPORT AREA

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

exports.unixTimestampSeconds = unixTimestampSeconds

exports.color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

exports.totalcase = () => {
    var file = fs.readFileSync("../index.js").toString()
    var jumlah = (file.match(/case '/g) || []).length;
    return jumlah
}
exports.totalfiturr = () => {
    const fitur1 = () => {
        var mytext = fs.readFileSync("./case.js").toString()
        var numUpper = (mytext.match(/case '/g) || []).length
        return numUpper
    }
    const fitur2 = () => {
        var mytext = fs.readFileSync("./case.js").toString()
        var numUpper = (mytext.match(/case "/g) || []).length
        return numUpper
    }
    const resulto = fitur1 + fitur2

    return {
        casee: resulto
    }
}
exports.generateMessageTag = (epoch) => {
    let tag = (0, exports.unixTimestampSeconds)().toString();
    if (epoch)
        tag += '.--' + epoch; // attach epoch if provided
    return tag;
}

exports.processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.getBuffer = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.getImg = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.fetchJson = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}
exports.webp2mp4File = async (path) => {
    return new Promise((resolve, reject) => {
        const form = new BodyForm()
        form.append('new-image-url', '')
        form.append('new-image', fs.createReadStream(path))
        axios({
            method: 'post',
            url: 'https://s6.ezgif.com/webp-to-mp4',
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`
            }
        }).then(({
            data
        }) => {
            const bodyFormThen = new BodyForm()
            const $ = cheerio.load(data)
            const file = $('input[name="file"]').attr('value')
            bodyFormThen.append('file', file)
            bodyFormThen.append('convert', "Convert WebP to MP4!")
            axios({
                method: 'post',
                url: 'https://ezgif.com/webp-to-mp4/' + file,
                data: bodyFormThen,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
                }
            }).then(({
                data
            }) => {
                const $ = cheerio.load(data)
                const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
                resolve({
                    status: true,
                    message: "Created By Eternity",
                    result: result
                })
            }).catch(reject)
        }).catch(reject)
    })
}

exports.fetchUrl = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.WAVersion = async () => {
    let get = await exports.fetchUrl("https://web.whatsapp.com/check-update?version=1&platform=web")
    let version = [get.currentVersion.replace(/[.]/g, ", ")]
    return version
}

exports.isNumber = (number) => {
    const int = parseInt(number)
    return typeof int === 'number' && !isNaN(int)
}
exports.TelegraPh = (Path) => {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
        try {
            const form = new BodyForm();
            form.append("file", fs.createReadStream(Path))
            const data = await axios({
                url: "https://telegra.ph/upload",
                method: "POST",
                headers: {
                    ...form.getHeaders()
                },
                data: form
            })
            return resolve("https://telegra.ph" + data.data[0].src)
        } catch (err) {
            return reject(new Error(String(err)))
        }
    })
}
const sleepy = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.fetchBuffer = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "GET",
            url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36",
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}
exports.toms = function(ms) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    let days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return {
        days,
        hours,
        minutes,
        seconds
    };
}
exports.runtime = function(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

exports.clockString = (ms) => {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

exports.getTime = (format, date) => {
    if (date) {
        return moment(date).locale('id').format(format)
    } else {
        return moment.tz('Asia/Kolkata').locale('id').format(format)
    }
}

exports.formatDate = (n, locale = 'id') => {
    let d = new Date(n)
    return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    })
}

function format(...args) {
    return util.format(...args)
}

exports.generateProfilePicture = async (buffer) => {
    const jimp = await Jimp.read(buffer)
    const min = jimp.getWidth()
    const max = jimp.getHeight()
    const cropped = jimp.crop(0, 0, min, max)
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    }
}

exports.bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

exports.getSizeMedia = (path) => {
    return new Promise((resolve, reject) => {
        if (/http/.test(path)) {
            axios.get(path)
                .then((res) => {
                    let length = parseInt(res.headers['content-length'])
                    let size = exports.bytesToSize(length, 3)
                    if (!isNaN(length)) resolve(size)
                })
        } else if (Buffer.isBuffer(path)) {
            let length = Buffer.byteLength(path)
            let size = exports.bytesToSize(length, 3)
            if (!isNaN(length)) resolve(size)
        } else {
            reject('I dont know what the error is')
        }
    })
}

exports.parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

exports.getGroupAdmins = (participants) => {
    let admins = []
    for (let i of participants) {
        i.admin === "superadmin" ? admins.push(i.id) : i.admin === "admin" ? admins.push(i.id) : ''
    }
    return admins || []
}

exports.checkBandwidth = async () => {
    let ind = 0;
    let out = 0;
    for (let i of await require("node-os-utils").netstat.stats()) {
        ind += parseInt(i.inputBytes);
        out += parseInt(i.outputBytes);
    }
    return {
        download: exports.bytesToSize(ind),
        upload: exports.bytesToSize(out),
    };
};

exports.formatSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

exports.jsonformat = (string) => {
    return JSON.stringify(string, null, 2);
};

exports.nganuin = async (url, options) => {
    try {
        options = options || {};
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        });
        return res.data;
    } catch (err) {
        return err;
    }
};

exports.pickRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

exports.shorturl = async function shorturl(longUrl) {
    try {
        const data = {
            url: longUrl
        };
        const response = await axios.post('https://shrtrl.vercel.app/', data);
        return response.data.data.shortUrl;
    } catch (error) {
        return error;
    }
};

exports.formatp = sizeFormatter({
    std: 'JEDEC', //'SI' = default | 'IEC' | 'JEDEC'
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
});

exports.logic = (check, inp, out) => {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length')
    for (let i in inp)
        if (util.isDeepStrictEqual(check, inp[i])) return out[i]
    return null
}

exports.protoType = () => {
    Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
        const ab = new ArrayBuffer(this.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < this.length; ++i) {
            view[i] = this[i];
        }
        return ab;
    }
    /**
     * @returns {ArrayBuffer}
     */
    Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
        return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength)
    }
    /**
     * @returns {Buffer}
     */
    ArrayBuffer.prototype.toBuffer = function toBuffer() {
        return Buffer.from(new Uint8Array(this))
    }

    Uint8Array.prototype.getFileType = ArrayBuffer.prototype.getFileType = Buffer.prototype.getFileType = async function getFileType() {
        return await fileTypeFromBuffer(this)
    }
    /**
     * @returns {Boolean}
     */
    String.prototype.isNumber = Number.prototype.isNumber = isNumber
    /**
     *
     * @returns {String}
     */
    String.prototype.capitalize = function capitalize() {
        return this.charAt(0).toUpperCase() + this.slice(1, this.length)
    }
    /**
     * @returns {String}
     */
    String.prototype.capitalizeV2 = function capitalizeV2() {
        const str = this.split(' ')
        return str.map(v => v.capitalize()).join(' ')
    }
    String.prototype.decodeJid = function decodeJid() {
        if (/:\d+@/gi.test(this)) {
            const decode = jidDecode(this) || {}
            return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim()
        } else return this.trim()
    }
    /**
     * number must be milliseconds
     * @returns {string}
     */
    Number.prototype.toTimeString = function toTimeString() {
        const seconds = Math.floor((this / 1000) % 60)
        const minutes = Math.floor((this / (60 * 1000)) % 60)
        const hours = Math.floor((this / (60 * 60 * 1000)) % 24)
        const days = Math.floor((this / (24 * 60 * 60 * 1000)))
        return (
            (days ? `${days} day(s) ` : '') +
            (hours ? `${hours} hour(s) ` : '') +
            (minutes ? `${minutes} minute(s) ` : '') +
            (seconds ? `${seconds} second(s)` : '')
        ).trim()
    }
    Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom
}

function isNumber() {
    const int = parseInt(this)
    return typeof int === 'number' && !isNaN(int)
}

function getRandom() {
    if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)]
    return Math.floor(Math.random() * this)
}

function rand(isi) {
    return isi[Math.floor(Math.random() * isi.length)]
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(`Update ${__filename}`)
    delete require.cache[file]
    require(file)
})