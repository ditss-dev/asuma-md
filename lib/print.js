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
    getGroupAdmins
} = require("./myfunc");
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
} = require('./myfunc')

const verifing = (type) => {
    if (type === "pairing") {
        console.clear()
        console.log(chalk.magenta.bold(`\n\n ‎ ‎  Gumdramon MD • coppyright©2024 - kiyo `));
        console.log(chalk.white(' ‎ ‎_____________________________________\n'));
        console.log(chalk.magenta.bold("Input Nomor Yang Aktif . . ."))
    } else {
        console.log(chalk.magenta.bold(`\n\n ‎ ‎  Gumdramon MD • coppyright©2024 - kiyo `));
        console.log(chalk.white(' ‎ ‎_____________________________________\n'));
        console.log(chalk.magenta.bold("Silahkan Scan Qr Di Bawah . . ."))
    }
}
const connectted = (ptz) => {
    let cxdf = JSON.stringify(ptz.user, null, 2)
    let cxdf2 = cxdf.replace("{", '')
        .replace(/"/g, '');

    console.clear()
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
    console.log(chalk.magentaBright.bold(` ‎ ‎    Gumdramon - MD • coppyright©2024 - kiyo`))
    console.log(chalk.white('     ‎ ‎_____________________________________\n'))

    const cxdf3 = cxdf2.replace("}", '')
    const used = process.memoryUsage();
    const cpus = os.cpus().map((cpu) => {
        cpu.total = Object.keys(cpu.times).reduce(
            (last, type) => last + cpu.times[type],
            0,
        );
        return cpu;
    });
    const cpu = cpus.reduce(
        (last, cpu, _, {
            length
        }) => {
            last.total += cpu.total;
            last.speed += cpu.speed / length;
            last.times.user += cpu.times.user;
            last.times.nice += cpu.times.nice;
            last.times.sys += cpu.times.sys;
            last.times.idle += cpu.times.idle;
            last.times.irq += cpu.times.irq;
            return last;
        }, {
            speed: 0,
            total: 0,
            times: {
                user: 0,
                nice: 0,
                sys: 0,
                idle: 0,
                irq: 0,
            },
        },
    );

    var date = new Date();
    var jam = date.getHours();
    var menit = date.getMinutes();
    var detik = date.getSeconds();
    var ram = `${formatSize(process.memoryUsage().heapUsed)} / ${formatSize(os.totalmem)}`;
    var cpuuuu = os.cpus();
    var sisaram = `${Math.round(os.freemem)}`;
    var totalram = `${Math.round(os.totalmem)}`;
    var persenram = (sisaram / totalram) * 100;
    var persenramm = 100 - persenram;
    var ramused = totalram - sisaram;

    var space = checkDiskSpace(process.cwd());
    var freespace = `${Math.round(space.free)}`;
    var totalspace = `${Math.round(space.size)}`;
    var diskused = totalspace - freespace;
    var neww = performance.now();
    var oldd = performance.now();
    let timestamp = speed();
    let latensi = speed() - timestamp;
    var {
        download,
        upload
    } = checkBandwidth();
    let respon = `
 ╭ > ${chalk.bgMagenta("[ S E R V E R - U S E D ]")}
 │ ▸ node ver: ${process.version}
 │ ▸ platform: ${os.platform()}
 │ ▸ upload: ${upload}
 │ ▸ download: ${download}
 │ ▸ free disk: ${formatSize(freespace)}
 │ ▸ free ram: ${formatSize(sisaram)} 
 ╰ >\n\n`
    console.log(chalk.bold(respon))
    console.log(chalk.white(` ‎ ‎Connected, welcome owner ! ` + chalk.magentaBright.bold(cxdf3)))

    console.log(chalk.white(' ‎ ‎_____________________________________\n'))
}

module.exports = {
    connectted,
    verifing
}