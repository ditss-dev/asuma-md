let handler = async (m, { reply, text, prefix, command }) => {
if (!text) throw `• *Example :* ${prefix + command} example code javascript`

try {
let kemii = await (await BalckBox(text)).response[0][0]
reply(kemii)
} catch(e) {
throw e
}

}

handler.command = ["blackbox"]

const axios = require("axios")
async function BalckBox(text) {
    return new Promise(async (resolve, reject) => {
        try {
            const respon = await axios.post('https://www.useblackbox.io/chat-request-v4', {
                text: text,
                allMessages: [{
                    user: text
                }],
                stream: '',
                clickedContinue: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux x86_64) Gecko/20130401 Firefox/71.3',
                }
            });
            resolve(respon.data)
        } catch (e) {
            reject(e)
        }
    })
}