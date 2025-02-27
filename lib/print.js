/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

const chalk = require('chalk')
const cfont = require('cfonts')
const process = require('process');
const toMs = require('ms');
const moment = require("moment-timezone")
const os = require('os');
const speed = require('performance-now')
const checkDiskSpace = require('check-disk-space').default;
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
} = require('./simple')

const verifing = (type) => {
    if (type === "pairing") {
        console.log(chalk.magenta.bold(`\n\n ‎ ‎  Gumdramon MD • coppyright©2024 - kiyo `));
        console.log(chalk.white(' ‎ ‎_____________________________________\n'));
        console.log(chalk.magenta.bold("Input Nomor Yang Aktif . . ."))
    } else {
        console.log(chalk.magenta.bold(`\n\n ‎ ‎  Gumdramon MD • coppyright©2024 - kiyo `));
        console.log(chalk.white(' ‎ ‎_____________________________________\n'));
        console.log(chalk.magenta.bold("Silahkan Scan Qr Di Bawah . . ."))
    }
}
const connectted = async (ptz) => {
  const cxdf = JSON.stringify(ptz.user, null, 2);
  const cxdf2 = cxdf.replace("{", '').replace(/"/g, '');
  const cxdf3 = cxdf2.replace("}", '');

  setTimeout(async() => {
    console.clear();
    cfont.say('<- Gumdramon ->', {
      font: 'chrome',
      align: 'left',
      colors: ['magenta', 'white'],
      background: 'white',
      letterSpacing: 1,
      lineHeight: 1,
      space: false,
      maxLength: '20',
    });

    console.log(chalk.magentaBright.bold(` ‎ ‎ Gumdramon - MD • coppyright©2024 - kiyo`));
    console.log(chalk.white(' ‎ ‎_____________________________________\n'));

    const used = process.memoryUsage();
    const cpus = os.cpus().map((cpu) => ({
      total: Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0),
    }));

    const cpu = cpus.reduce((last, cpu) => ({
      speed: last.speed + cpu.speed / cpus.length,
      total: last.total + cpu.total,
      times: {
        user: last.times.user + cpu.times.user,
        nice: last.times.nice + cpu.times.nice,
        sys: last.times.sys + cpu.times.sys,
        idle: last.times.idle + cpu.times.idle,
        irq: last.times.irq + cpu.times.irq,
      },
    }), {
      speed: 0,
      total: 0,
      times: {
        user: 0,
        nice: 0,
        sys: 0,
        idle: 0,
        irq: 0,
      },
    });

    const date = new Date();
    const jam = date.getHours();
    const menit = date.getMinutes();
    const detik = date.getSeconds();

    const ram = `${formatSize(process.memoryUsage().heapUsed)} / ${formatSize(os.totalmem)}`;
    const cpuuuu = os.cpus();
    const sisaram = `${Math.round(os.freemem)}`;
    const totalram = `${Math.round(os.totalmem)}`;
    const persenram = (sisaram / totalram) * 100;
    const persenramm = 100 - persenram;
    const ramused = totalram - sisaram;

    const space = await checkDiskSpace(process.cwd());
    const freespace = `${Math.round(space.free)}`;
    const totalspace = `${Math.round(space.size)}`;
    const diskused = totalspace - freespace;

    const neww = performance.now();
    const oldd = performance.now();
    const timestamp = speed();
    const latensi = speed() - timestamp;

    const { download, upload } = await checkBandwidth();

    const respon = `
 ╭ > ${chalk.bgMagenta("[ S E R V E R - U S E D ]")}
 │ ▸ node ver: ${process.version}
 │ ▸ platform: ${os.platform()}
 │ ▸ upload: ${upload}
 │ ▸ download: ${download}
 │ ▸ free disk: ${formatSize(freespace)}
 │ ▸ free ram: ${formatSize(sisaram)}
 ╰ >
`;

    console.log(chalk.bold(respon));
    console.log(chalk.white(` ‎ ‎Connected, welcome owner ! ` + chalk.magentaBright.bold(cxdf3)));
    console.log(chalk.white(' ‎ ‎_____________________________________\n'));
  }, 3000);
};

module.exports = {
    connectted,
    verifing
}