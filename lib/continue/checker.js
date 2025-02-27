const axios = require('axios');
const fs = require('fs');
const chalk = require("chalk");
const cp = require('child_process');
const repoku = 'R9-Gumdramon';
const packageJson = require('../../package.json'); 
const nowVersi = packageJson.version;

const mygithub = `https://api.github.com/repos/pixiel-kiyo/${repoku}/contents/package.json`;

function cekVersiSc(version1, version2) {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const n1 = v1[i] || 0;
    const n2 = v2[i] || 0;

    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }

  return 0;
}

exports.version = async () => {
    try {
        console.log("Mengecek versi...");
        const response = await axios.get(mygithub);
        console.log("Sukses mengecek versi.");

        const jsonCont = response.data.content;
        const parseJson = JSON.parse(Buffer.from(jsonCont, 'base64').toString());
        const newVersi = parseJson.version;
        const nowVersi = packageJson.version;

        if (cekVersiSc(newVersi, nowVersi) > 0) {
            console.log(chalk.black.bgWhite("[ Version " + nowVersi + " < need to update ]"));
        } else {
            console.log(chalk.black.bgWhite("[ Version " + nowVersi + " < latest ]"));
        }
    } catch (error) {
        console.log(chalk.black.bgWhite("[ Version " + nowVersi + " < whatsapp run ]"));
    }
};

exports._quickTest = async function () {
  let test = await Promise.all([
    cp.spawn('ffmpeg'),
    cp.spawn('ffprobe'),
    cp.spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    cp.spawn('convert'),
    cp.spawn('magick'),
    cp.spawn('gm'),
    cp.spawn('find', ['--version'])
  ].map(p => {
    return Promise.race([
      new Promise(resolve => {
        p.on('close', code => {
          resolve(code !== 127)
        })
      }),
      new Promise(resolve => {
        p.on('error', _ => resolve(false))
      })
    ])
  }))
  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  console.log(test)
  let s = support = {
    ffmpeg,
    ffprobe,
    ffmpegWebp,
    convert,
    magick,
    gm,
    find
  }
  Object.freeze(support)

  if (!s.ffmpeg) console.log('Please install ffmpeg for sending videos (pkg install ffmpeg)')
  if (s.ffmpeg && !s.ffmpegWebp) console.log('Stickers may not animated without libwebp on ffmpeg (--enable-ibwebp while compiling ffmpeg)')
  if (!s.convert && !s.magick && !s.gm) console.log('Stickers may not work without imagemagick if libwebp on ffmpeg doesnt isntalled (pkg install imagemagick)')
}

/*exports.update = () => {
}*/