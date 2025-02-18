/**

 # ========================================
 * Bot By : Kiyoshiroo
 * github : https://github.com/pixiel-kiyo
 * Repo : Xros-Gumdramon
 * type : Case & Plugin 
 # ========================================
 
 **/

const fs = require('fs')
const path = require('path')
const ff = require('fluent-ffmpeg');

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
    return new Promise((resolve, reject) => {
        try {
            let tmp = path.join(__dirname, '../tmp', +new Date + '.' + ext);
            let out = tmp + '.' + ext2;
            fs.writeFileSync(tmp, buffer);

            ff(tmp)
                .setFormat(ext2)
                .setAudioCodec('libopus')
                .setAudioBitrate('128k')
                .setVideoCodec('libx264')
                .setVideoBitrate('128k')
                .addOptions(args)
                .save(out)
                .on('end', async () => {
                    try {
                        await fs.promises.unlink(tmp);
                        resolve({
                            data: await fs.promises.readFile(out),
                            filename: out,
                            delete() {
                                return fs.promises.unlink(out);
                            }
                        });
                    } catch (e) {
                        reject(e);
                    }
                })
                .on('error', reject);
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Convert Audio to Playable WhatsApp Audio
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 */
function toPTT(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
    ], ext, 'ogg')
}

/**
 * Convert Audio to Playable WhatsApp PTT
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 */
function toAudio(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
        '-compression_level', '10'
    ], ext, 'opus')
}

/**
 * Convert Audio to Playable WhatsApp Video
 * @param {Buffer} buffer Video Buffer
 * @param {String} ext File Extension 
 */
function toVideo(buffer, ext) {
    return ffmpeg(buffer, [
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-ab', '128k',
        '-ar', '44100',
        '-crf', '32',
        '-preset', 'slow'
    ], ext, 'mp4')
}

module.exports = {
    toAudio,
    toPTT,
    toVideo,
    ffmpeg,
}