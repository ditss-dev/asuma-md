const fs = require('fs');
const toMs = require('ms');

/**
 * Add Sewa group.
 * @param {String} gid 
 * @param {String} subject
 * @param {String} link
 * @param {String} expired 
 * @param {Object} _dir 
 */
const addSewaGroup = (gid, subject, link, expired, _dir) => {
    let position = _dir.findIndex((group) => group.id === gid);
    
    if (position !== -1) {
        _dir[position].expired = Date.now() + toMs(expired);
    } else {
        const obj = {
            id: gid,
            group: subject,
            linkgc: link,
            expired: Date.now() + toMs(expired)
        };
        _dir.push(obj);
    }
    console.log(toMs(expired))
    // Save to file
    fs.writeFileSync('./lib/database/sewa.json', JSON.stringify(_dir));
};

/**
 * Get sewa group position.
 * @param {String} gid 
 * @param {Object} _dir 
 * @returns {Number | undefined}
 */
const getSewaPosition = (gid, _dir) => {
    return _dir.findIndex((group) => group.id === gid);
};

/**
 * Get sewa group expire.
 * @param {String} gid 
 * @param {Object} _dir 
 * @returns {Number | undefined}
 */
const getSewaExpired = (gid, _dir) => {
    const position = getSewaPosition(gid, _dir);
    return position !== -1 ? _dir[position].expired : undefined;
};

/**
 * Check if a group is sewa.
 * @param {String} gid 
 * @param {Object} _dir 
 * @returns {Boolean}
 */
const checkSewaGroup = (gid, _dir) => {
    return _dir.some((group) => group.id === gid);
};

/**
 * Constantly checking sewa expiration.
 * @param {object} conn
 * @param {Object} _dir 
 */
const expiredCheck = async (conn, _dir) => {
    let expiredGroups = [];

    _dir.forEach((group, index) => {
        if (Date.now() >= group.expired) {
            expiredGroups.push(index);
        }
    });

    for (let position of expiredGroups) {
        console.log(`Sewa expired: ${_dir[position].id}`);
        
        let getGroups = await conn.groupFetchAllParticipating();
        let groupIds = Object.values(getGroups).map(group => group.id);
 
        if (!_dir[position].id) continue;

        if (groupIds.includes(_dir[position].id)) {
            let message = `Waktu sewa di grup ini sudah habis, bot akan keluar otomatis`;

            await conn.sendMessage(_dir[position].id, { text: message });
            await conn.groupLeave(_dir[position].id);

            _dir.splice(position, 1);
            fs.writeFileSync('./lib/database/sewa.json', JSON.stringify(_dir));
        } else {
            _dir.splice(position, 1);
            fs.writeFileSync('./lib/database/sewa.json', JSON.stringify(_dir));
        }
    }
};

const addJadibot = (gid, expired, _dir) => {
  let position = _dir.findIndex((sender) => sender.id === gid);
    
    if (position !== -1) {h
        _dir[position].expired = Date.now() + toMs(expired);
    } else {
        const obj = {
            id: gid,
            Jadibot: "process",
            status: true,
            expired: Date.now() + toMs(expired)
        };
        _dir.push(obj);
    }
    console.log(toMs(expired))
    fs.writeFileSync('./lib/database/jadibot.json', JSON.stringify(_dir));
}
                
const cekJadibot = async (_dir, conn, type = false) => {
const expiredJadibots = [];

_dir.forEach((sender, index) => {
    console.log(sender.expired)
    if (Date.now() >= sender.expired) {
      expiredJadibots.push(index);
    }
  });

for (const position of expiredJadibots) {
  console.log(`Sewa expired: ${_dir[position].id}`);

  const JadibotIds = Object.values(_dir).map(Jadibot => Jadibot.id);
  
  if (!_dir[position].id) continue;
  if (type) {
  _dir.splice(position, 1);
  fs.writeFileSync('./lib/database/jadibot.json', JSON.stringify(_dir));
  return console.log(" ")
  }
  
  if (!_dir[position].status) continue;
  if (JadibotIds.includes(_dir[position].id)) {
    const message = `Waktu Jadibot habis, Silahkan renew di bot ini.`;
    try {
      console.log(message)
      await conn.sendMessage(_dir[position].id, { text: message });
    } catch (error) {
      console.error(error);
    }
  }
  
  _dir[position].status = false
    
  try {
    fs.writeFileSync('./lib/database/jadibot.json', JSON.stringify(_dir));
  } catch (error) {
    console.error(error);
  }
 
}
};

const addTimeJadibot = (gid, waktu, _dir) => {
  let position = _dir.findIndex((sender) => sender.id === gid);
  if (position !== -1) {
    _dir[position].expired = Date.now() + toMs(waktu);
    _dir[position].status = true
    fs.writeFileSync('./lib/database/jadibot.json', JSON.stringify(_dir));
  } 
};

const addTimeSewa = (gid, waktu, _dir) => {
  let position = _dir.findIndex((group) => group.id === gid);
  if (position !== -1) {
    _dir[position].expired = Date.now() + toMs(waktu);
    fs.writeFileSync('./lib/database/sewa.json', JSON.stringify(_dir));
  }
};
               
const getAllPremiumUser = (_dir) => {
    return _dir.map((group) => group.id);
};

const getJadibotPosition = (gid, _dir) => {
    return _dir.findIndex((group) => group.id === gid);
};

const getJadibotExpired = (gid, _dir) => {
    const position = getSewaPosition(gid, _dir);
    return position !== -1 ? _dir[position].expired : undefined;
};

const checkJadibotUser = (gid, _dir) => {
    return _dir.some((group) => group.id === gid);
};

module.exports = {
    addSewaGroup,
    getSewaExpired,
    getSewaPosition,
    addTimeSewa,
    expiredCheck,
    checkSewaGroup,
    getAllPremiumUser,
    addJadibot,
    cekJadibot,
    addTimeJadibot,
    getJadibotPosition,
    getJadibotExpired,
    checkJadibotUser
};