const qrcode = require("qrcode");
const cheerio = require("cheerio");
const moment = require("moment-timezone");
const fetch = require("node-fetch");

class Saweria {
  constructor(user_id) {
    this.user_id = user_id;
    this.baseUrl = "https://saweria.co";
    this.apiUrl = "https://backend.saweria.co";
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const { data } = await response.json();

      if (!data || !data.id) {
        return {
          creator: "Kiyoo",
          status: false,
          msg: "Failed to login",
        };
      }

      return {
        creator: "Kiyoo",
        status: true,
        data: {
          user_id: data.id,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        creator: "Kiyoo",
        status: false,
        msg: error.message,
      };
    }
  }

  async createPayment(amount, msg = "Order") {
    try {
      if (!this.user_id) {
        return {
          creator: "Kiyoo",
          status: false,
          msg: "USER ID NOT FOUND",
        };
      }

      const response = await fetch(`${this.apiUrl}/donations/${this.user_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agree: true,
          amount: Number(amount),
          customer_info: {
            first_name: "Payment Gateway",
            email: "gateway@nomisec07.tech",
            phone: "",
          },
          message: msg,
          notUnderAge: true,
          payment_type: "qris",
          vote: "",
        }),
      });

      const { data } = await response.json();

      if (!data || !data.id) {
        return {
          creator: "Kiyoo",
          status: false,
          msg: "Failed to create payment",
        };
      }

      const qr_string = data.qr_string;
      const qr_image = await qrcode.toDataURL(qr_string, {
        scale: 8,
      });

      return {
        creator: "Kiyoo",
        status: true,
        data: {
          ...data,
          expired_at: moment(data.created_at)
            .add(10, "minutes")
            .format("DD/MM/YYYY HH:mm:ss"),
          receipt: `${this.baseUrl}/qris/${data.id}`,
          url: `${this.baseUrl}/qris/${data.id}`,
          qr_image: qr_image,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        creator: "Kiyoo",
        status: false,
        msg: error.message,
      };
    }
  }

  async checkPayment(id) {
    try {
      if (!this.user_id) {
        return {
          creator: "Kiyoo",
          status: false,
          msg: "USER ID NOT FOUND",
        };
      }

      const response = await fetch(`${this.baseUrl}/receipt/${id}`, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      });

      const text = await response.text();
      const $ = cheerio.load(text);
      const msg = $("h2.chakra-heading.css-14dtuui").text();

      if (!msg) {
        return {
          creator: "Kiyoo",
          status: false,
          msg: '❌ Transaksi tidak di temukan atau tidak selesai\n\nNote: Cek lagi transaksi menggunakan ".saweria check" buat cek transaksi yang belum selesai atau belum sama sekali, mohon hubungi owner jika kamu ada kendala',
        };
      }

      const status = msg.toLowerCase() === "berhasil";
      return {
        creator: "Kiyoo",
        status,
        msg: msg.toUpperCase(),
      };
    } catch (error) {
      console.log(error);
      return {
        creator: "Kiyoo",
        status: false,
        msg: error.message,
      };
    }
  }
}

module.exports = { Saweria }