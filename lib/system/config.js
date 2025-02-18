/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

const fs = require('fs')
const {
    color
} = require('../../lib/myfunc')

//owner
global.owner = ['6283117190495']
global.nomerowner = ["6283117190495"]

//sticker
global.packname = 'Bublegum'
global.author = 'Gumdramon MD'

// biarin
global.urldb = '';

// thumbnail
global.thumurl = "https://files.catbox.moe/afqydo.jpg"
global.thumurl2 = "https://files.catbox.moe/glt7ub.jpg"

//saluran
global.urls = "https://whatsapp.com/channel/0029VauYaRAJZg45fQAoeQ0M"
global.ids = "120363376187287513@newsletter"
global.nems = "© kiyoshiro"
global.charco = 49, 50, 48, 51, 54, 51, 51, 55, 54, 49, 56, 55, 50, 56, 55, 53, 49, 51, 64, 110, 101, 119, 115, 108, 101, 116, 116, 101, 114
// pterodactyl panel
global.domain = 'https://ptero.vcloudxofficial.xyz' // isi domain
global.apikey = 'ptla_zXwlmTbvnGKq8YutSMalfe1bekYk4Jje2sKufGGMK1Z' // Isi Apikey Plta Lu
global.capikey = 'ptlc_P33AFBDJ6Eg8kXw4NVVzug15kVeFV07wousfJXUEjSV' // Isi Apikey Pltc Lu
global.eggsnya = '15' // id eggs yang dipakai
global.location = '1' // id location

global.listsewa = `[ EMPTY ]`

//messages reply
global.mess = {
    done: '*`[ GUMDRAMON ] : Request completed !`*',
    owner: '*`[ GUMDRAMON ] : For an owner only`*',
    private: '*`[ GUMDRAMON ] : In Private only`*',
    group: '*`[ GUMDRAMON ] : Only available in group`*',
    wait: '*`[ GUMDRAMON ] : Request processed..`*',
    error: '*`[ GUMDRAMON ] : Error try again later`*',
    admin: '*`[ GUMDRAMON ] : You are not an admin`*',
    botAdmin: '*`[ GUMDRAMON ] : Your bot is not an admin`*',
    premium: '*`[ GUMDRAMON ] : You not a premium user`*',
    jadibot: '*`[ GUMDRAMON ] : You not a jadibot user`*',
}

global.title = "Gumdramon Digivo-lution"
global.body = "ʀᴏᴀᴅ ᴛᴏ ʀᴀᴍᴀᴅʜᴀɴ"
global.filename = "𝗡𝗔𝗧𝗨𝗥𝗘-𝗦𝗣"
global.jpegfile = "𝗠𝗗 𝗚𝘂𝗺𝗱𝗿𝗮𝗺𝗼𝗻"
global.botname = "𝗚𝘂𝗺𝗱𝗿𝗮𝗺𝗼𝗻"
global.ownername = "Kiyo hitam"

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(color(`Update'${__filename}'`))
    delete require.cache[file]
    require(file)
})