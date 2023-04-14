//คนที่ก็อปไฟล์ทั้งหมดไป อย่าลืมเปลี่ยน ../ ./ เนื่องจากตำแหน่งอาจไม่ถูกต้อง
const fs = require('node:fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Manager } = require("erela.js");
const { token } = require('./config.json');

const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

//ทำการโหลดไฟล์คำสั่งเข้าบอท
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}
//ทำการโหลดไฟล์คำสั่งเข้าบอท

//ทำการโหลดไฟล์ Event เข้าบอท
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
//ทำการโหลดไฟล์ Event เข้าบอท

client.manager = new Manager({
    nodes: [
        {
            host: "127.0.0.1",
            port: 2333,
            password: "xeno",
        },
    ],
    send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    },
});

//ทำการโหลดไฟล์ Event erela เข้าบอท
const erelaFiles = fs.readdirSync('./erelajs').filter(file => file.endsWith('.js'));

for (const file of erelaFiles) {
	const event = require(`./erelajs/${file}`);
	client.manager.on(event.name, (...args) => event.execute(...args));
}
//ทำการโหลดไฟล์ Event erela เข้าบอท

client.on("raw", (r) => client.manager.updateVoiceState(r));
//จำเป็นต้องมี ส่งค่า Event voice ต่าง ๆ ให้ erela จัดการ

client.login(token);