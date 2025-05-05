const tls = require('tls');
const WebSocket = require('ws');
const extractJsonFromString = require('extract-json-from-string');
const connect = require('./node_modules/ws/browser.js');

const L = "";
const T = "";
const S = "";
const K = "";

const aldertosSocket = tls.connect({
    host: "canary.discord.com",
    port: 443,
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.2",
    handshakeTimeout: 1,
    servername: "canary.discord.com"
});

let vanity = {vanity: "",event: null,};
const guilds = {};

aldertosSocket.on("data", async (data) => {
    const ext = await extractJsonFromString(data.toString());
    if (!Array.isArray(ext)) {
      console.error("no array", ext);
      return;
    }

    const find = ext && (ext.find((e) => e.code) || ext.find((e) => e.message && e.message.toLowerCase().includes("rate")));
    if (find) {

        const aldertosBody = JSON.stringify({
            content: `\n\`\`\`json\n${JSON.stringify(find, null, 2)}\`\`\``,
        });

        const aldertosLength = Buffer.byteLength(aldertosBody);
        const aldertosHeader = [
            `POST /api/v7/channels/${K}/messages HTTP/1.1`,
            "Host: canary.discord.com",
            `Authorization: ${T}`,
            "Content-Type: application/json",
            `Content-Length: ${aldertosLength}`,
            "",
            "",
        ].join("\r\n");
        const istek = aldertosHeader + aldertosBody;
        aldertosSocket.write(istek);
    }
});

aldertosSocket.on("error", (error) => {console.log(`tls error`, error);});
aldertosSocket.on("end", () => {console.log("tls connection closed");});
aldertosSocket.on("secureConnect", () => {const websocket = new WebSocket("wss://gateway.discord.gg/");websocket.onclose = (event) => {console.log(`ws connection closed ${event.reason} ${event.code}`);};

    websocket.onmessage = async (message) => {
        const { d, op, t } = JSON.parse(message.data);

        if (t === "GUILD_UPDATE") {
            const find = guilds[d.guild_id];
            if (find && find !== d.vanity_url_code) {
                const aldertosBody = JSON.stringify({ code: find });
                const aldertosHeader = [
                    `PATCH /api/v7/guilds/${S}/vanity-url HTTP/1.1`,
                    `Host: canary.discord.com`,
                    `Authorization: ${T}`,
                    `Content-Type: application/json`,
                    `Content-Length: ${Buffer.byteLength(aldertosBody)}`,
                    "",
                    "",
                ].join("\r\n");
                const istek = aldertosHeader + aldertosBody;
                aldertosSocket.write(istek);
                vanity.vanity = `${find}`;
            }
        } else if (t === "READY") {
            d.guilds.forEach((guild) => {
                if (guild.vanity_url_code) {
                    guilds[guild.id] = guild.vanity_url_code;
                }
            });
            console.log(guilds);
        }

        if (op === 10) {
            websocket.send(JSON.stringify({
                op: 2,
                d: {
                    token: L,
                    connect,
                    intents: 513 << 0,
                    properties: {
                        os: "macOS",
                        browser: "Safari",
                        device: "MacBook Air",
                    },
                },
            }));

setInterval(() => websocket.send(JSON.stringify({ op: 1, d: {}, s: null, t: "heartbeat" })), d.heartbeat_interval);} else if (op === 7) {}};
setInterval(() => {aldertosSocket.write("GET / HTTP/1.1\r\nHost: canary.discord.com\r\n\r\n");}, 400);});
