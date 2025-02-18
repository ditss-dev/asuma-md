module.exports = {
  name: 'Fitur Brat',
  command: ['brat'],
  category: 'tools',
  description: 'Command for the bot',
  args: [],
  execution: function({ sock, m, args, prefix, sleep }) {
  const getBuffer = async(url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (err) {
		return err
	}
}
  const text = args[0]
	try {
	const buffer = getBuffer(`https://siputzx-bart.hf.space/?q=${encodeURIComponent(text)}`)
  sock.sendImageAsSticker(m.chat, buffer, m, { packname: "Brat", author: "Tes Gumdramon Multi plugin" })
} catch (err) {
   console.log(err)
	}			
  },
  hidden: false,
};

			