const PhoneNumber = require("awesome-phonenumber");
const Saweria = require("../../../importe/scraper/saweria.js");

function formatter(value) {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function calculatePPN(value) {
  return value * 0.1;
}

function removeItem(array, item) {
  return array.filter(
    (elem) => !(elem.jid === item.jid && elem.state === item.state),
  );
}

let handler = async (m, { ptz, isCreator, prefix, command, args }) => {
  ptz.saweria = ptz.saweria || "";
  ptz.gateway = ptz.gateway || [];

  const Pay = new Saweria(ptz.saweria);

  if (args[0] === "payment" || args[0] === "unban" || args[0] === "unblock") {
    const itemName = args[0].toUpperCase();
    const price = 1000;
    const pending = ptz.gateway.find(
      (v) => v.jid === m.sender && v.state === "PENDING",
    );
    const process = ptz.gateway.find(
      (v) => v.jid === m.sender && v.state === "PROCESS",
    );

    if (pending || process) {
      return m.reply(
        `Selesaikan terlebih dahulu proses sebelumnya atau kirim *${prefix}saweria n* untuk membatalkan.`,
      );
    }

    const formattedPrice = formatter(price);
    const formattedPPN = formatter(calculatePPN(price));

    let teks = `Anda akan melakukan pembelian ${itemName} dengan rincian sebagai berikut:\n\n`;
    teks += `• Nomor: ${PhoneNumber("+" + m.sender.split("@")[0]).getNumber("international")}\n`;
    teks += `• Harga: Rp. ${formattedPrice},-\n`;
    teks += `• PPN: Rp. ${formattedPPN},-\n\n`;
    teks += `Kirim *${prefix}saweria y* untuk melanjutkan proses pembayaran atau kirim *${prefix}saweria n* untuk membatalkan.`;

    m.reply(teks).then(() => {
      ptz.gateway.push({
        state: "PENDING",
        jid: m.sender,
        amount: price,
        admin: calculatePPN(price),
        package: itemName,
        created_at: Date.now(),
        receipt: "",
      });
    });
  } else if (args[0] === "y") {
    const gateway = ptz.gateway.find(
      (v) => v.jid === m.sender && v.state === "PENDING",
    );
    if (!gateway) return;

    m.reply("Menghasilkan QR Code pembayaran...");
    const total = parseInt(gateway.amount) + parseInt(gateway.admin);
    const json = await Pay.createPayment(total, gateway.package);

    if (!json.status)
      return m.reply(
        `Terjadi kesalahan saat menghasilkan pembayaran:\n${json.msg}`,
      );

    let teks = `Info Pembayaran\n\n`;
    teks += `Pembayaran sebelum ${json.data.expired_at} WIB\n\n`;
    teks += `• ID Pembayaran: ${json.data.id}\n`;
    teks += `• Total Pembayaran: Rp. ${formatter(json.data.amount_raw)},-\n\n`;
    teks += `Catatan:\n`;
    teks += `- Kode QR hanya valid untuk 1 kali transfer.\n`;
    teks += `- Setelah pembayaran, tunggu sebentar lalu kirim *${prefix}saweria check* untuk cek status pembayaran.\n`;
    teks += `- Jika pembayaran berhasil, status akan diperbarui otomatis\n`;
    teks += `- Untuk bantuan lebih lanjut, hubungi *${prefix}owner*`;

    ptz
      .sendFile(
        m.chat,
        Buffer.from(json.data.qr_image.split(",")[1], "base64"),
        "qr.png",
        teks,
        m,
      )
      .then(() => {
        gateway.state = "PROCESS";
        gateway.receipt = json.data.id;
      });
  } else if (args[0] === "n") {
    const pending = ptz.gateway.find(
      (v) => v.jid === m.sender && v.state === "PENDING",
    );
    const process = ptz.gateway.find(
      (v) => v.jid === m.sender && v.state === "PROCESS",
    );

    if (!pending && !process) {
      return m.reply(` Pembelian berhasil dibatalkan.`);
    }

    m.reply(`Pembelian berhasil dibatalkan.`);
    if (pending) {
      ptz.gateway = removeItem(ptz.gateway, pending);
    }
    if (process) {
      ptz.gateway = removeItem(ptz.gateway, process);
    }
  } else if (args[0] === "check") {
    const gateway = ptz.gateway.find(
      (v) => v.jid === m.sender && v.state === "PROCESS",
    );
    if (!gateway) return;

    m.reply("Memeriksa status pembayaran...");
    const json = await Pay.checkPayment(gateway.receipt);

    if (!json.status)
      return m.reply(
        `Terjadi kesalahan saat memeriksa status pembayaran:\n${json.msg}`,
      );

    m.reply(`Status Pembayaran: ✅ ${json.msg}`).then(() => {
      let data = global.db.users.find((v) => v.jid === gateway.jid);

      if (gateway.package === "PREMIUM") {
        data.limit += 5000;
        data.expired += data.premium
          ? 86400000 * 30
          : Date.now() + 86400000 * 30;
        data.premium = true;
      } else if (gateway.package === "UNBAN") {
        data.banned = false;
        data.banTemp = 0;
        data.banTimes = 0;
      } else if (gateway.package === "UNBLOCK") {
        ptz.updateBlockStatus(gateway.jid, "unblock");
      } else if (gateway.package === "DEPOSITO") {
        data.balance += gateway.amount;
      }

      ptz.gateway = removeItem(ptz.gateway, gateway);
    });
  } else if (args[0] === "login") {
    if (!isCreator)
      return m.reply("Hanya owner yang dapat menggunakan perintah ini.");
    if (!args[1] || !args[2])
      return m.reply(
        "Penggunaan: *" + prefix + "login email@mail.com password*",
      );

    let email = args[1];
    let password = args[2];

    m.reply("Sedang login...");
    const json = await Pay.login(email, password);

    if (!json.status)
      return m.reply(`Terjadi kesalahan saat login:\n${json.msg}`);

    m.reply(`✅ Login Sukses : ${json.data.user_id}`).then(() => {
      ptz.saweria = json.data.user_id;
    });
  } else {
    m.reply(
      `Penggunaan:\n• *${prefix}saweria payment* - Memulai pembelian\n• *${prefix}saweria unban* - Membuka banned\n• *${prefix}saweria unblock* - Membuka block\n• *${prefix}saweria y* - Melanjutkan pembayaran\n• *${prefix}saweria n* - Membatalkan pembelian\n• *${prefix}saweria check* - Memeriksa status pembayaran\n• *${prefix}saweria login email@mail.com password* - Login ke akun Saweria`,
    );
  }
};

handler.command = ["saweria"]
module.exports = handler;