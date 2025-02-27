/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

const {
    proto,
    delay,
    getContentType,
    generateWAMessage,
    areJidsSameUser,
    getAggregateVotesInPollMessage
} = require('@adiwajshing/baileys')
const chalk = require('chalk')
const axios = require('axios');
const {
    sizeFormatter
} = require('human-readable');
const fs = require("fs");

const smsg = (ptz, m, store) => {
    try {
        if (!m) return m;
        let M = proto.WebMessageInfo;
        if (m.key) {
            m.id = m.key.id;
            m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
            m.chat = m.key.remoteJid;
            m.fromMe = m.key.fromMe;
            m.isGroup = m.chat.endsWith('@g.us');
            m.sender = ptz.decodeJid(m.fromMe && ptz.user.id || m.participant || m.key.participant || m.chat || '');
            if (m.isGroup) m.participant = ptz.decodeJid(m.key.participant) || '';
        }
        if (m.message) {
            m.mtype = getContentType(m.message);
            m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
            m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text;
            let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null;
            m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
            if (m.msg.caption) {
                m.caption = m.msg.caption;
            }
            if (m.quoted) {
                let type = Object.keys(m.quoted)[0];
                m.quoted = m.quoted[type];
                if (['productMessage'].includes(type)) {
                    type = Object.keys(m.quoted)[0];
                    m.quoted = m.quoted[type];
                }
                if (typeof m.quoted === 'string') m.quoted = {
                    text: m.quoted
                };
                m.quoted.mtype = type;
                m.quoted.id = m.msg.contextInfo.stanzaId;
                m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
                m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false;
                m.quoted.sender = ptz.decodeJid(m.msg.contextInfo.participant);
                m.quoted.fromMe = m.quoted.sender === ptz.decodeJid(ptz.user.id);
                m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || '';
                m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
                m.getQuotedObj = m.getQuotedMessage = async () => {
                    if (!m.quoted.id) return false;
                    let q = await store.loadMessage(m.chat, m.quoted.id, ptz);
                    return smsg(ptz, q, store);
                };
                let vM = m.quoted.fakeObj = M.fromObject({
                    key: {
                        remoteJid: m.quoted.chat,
                        fromMe: m.quoted.fromMe,
                        id: m.quoted.id
                    },
                    message: quoted,
                    ...(m.isGroup ? {
                        participant: m.quoted.sender
                    } : {})
                });
                m.quoted.delete = () => ptz.sendMessage(m.quoted.chat, {
                    delete: vM.key
                });
                m.quoted.copyNForward = (jid, forceForward = false, options = {}) => ptz.copyNForward(jid, vM, forceForward, options);
                m.quoted.download = () => ptz.downloadMediaMessage(m.quoted);
            }
        }
        if (m.msg.url) m.download = () => ptz.downloadMediaMessage(m.msg);
        m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || '';
        m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? ptz.sendMedia(chatId, text, 'file', '', m, {
            ...options
        }) : ptz.sendText(chatId, text, m, {
            ...options
        });
        m.copy = () => smsg(ptz, M.fromObject(M.toObject(m)));
        m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => ptz.copyNForward(jid, m, forceForward, options);
        ptz.appenTextMessage = async (text, chatUpdate) => {
            let messages = await generateWAMessage(m.chat, {
                text: text,
                mentions: m.mentionedJid
            }, {
                userJid: ptz.user.id,
                quoted: m.quoted && m.quoted.fakeObj
            });
            messages.key.fromMe = areJidsSameUser(m.sender, ptz.user.id);
            messages.key.id = m.key.id;
            messages.pushName = m.pushName;
            if (m.isGroup) messages.participant = m.sender;
            let msg = {
                ...chatUpdate,
                messages: [proto.WebMessageInfo.fromObject(messages)],
                type: 'append'
            };
            ptz.ev.emit('messages.upsert', msg);
        };

        return m;
    } catch (e) {

    }
};

async function pollup(chatUpdate, store, ptz) {
try {
        async function getMessage(key) {
        if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id)
            return msg?.message
        }
        return {
            conversation: "Hi from Gumdramon"
        }
    }

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
    } catch(e) {
    console.log(e)
    }
}

const tocase = async (chatUpdate, store, ptz) => {
    const mek = chatUpdate.messages[0];
    if (!mek.message) return;

    mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ?
        mek.message.ephemeralMessage.message :
        mek.message;

    if (mek.key && mek.key.remoteJid === 'status@broadcast') {
        await ptz.readMessages([mek.key]);
    }

    if (!mek.key.fromMe && chatUpdate.type === 'notify') {

        let sender = mek.key.remoteJid;
        if (sender.endsWith('@g.us')) {

            let groupMetadata = store.groupMetadata?.[sender];
            if (!groupMetadata) {
                try {
                    store.groupMetadata = store.groupMetadata || {};
                    store.groupMetadata[sender] = await ptz.groupMetadata(sender);
                    groupMetadata = store.groupMetadata[sender];
                } catch (e) {}
            }

            let participant = mek.key.participant || mek.participant;
            let senderName = groupMetadata?.participants?.find(p => p.id === participant)?.name || participant;

        } else {
            if (!store.contacts[sender]) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

    }

    if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;

    const m = smsg(ptz, mek, store);
    require("../case")(ptz, m, chatUpdate, store);
};

const saver = async (update, store, ptz) => {
    for (let contact of update) {
        let id = ptz.decodeJid(contact.id);
        let name = contact.notify || contact.name || id.split('@')[0];

        if (store && store.contacts) {
            store.contacts[id] = {
                id,
                name
            };
        }
    }
}

module.exports = {
    smsg,
    tocase,
    pollup,
    saver
};