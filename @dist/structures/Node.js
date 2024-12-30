"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const Utils_1 = require("./Utils");
const NodeCheck_1 = __importDefault(require("../utils/NodeCheck"));
const ws_1 = __importDefault(require("ws"));
const V4RestHandler_1 = require("./rest/V4RestHandler");
const V3RestHandler_1 = require("./rest/V3RestHandler");
class Node {
    get connected() {
        if (!this.socket)
            return false;
        return this.socket.readyState === ws_1.default.OPEN;
    }
    get address() {
        return `${this.options.host}:${this.options.port}`;
    }
    static init(manager) {
        this._manager = manager;
    }
    constructor(options) {
        this.options = options;
        this.socket = null;
        this.calls = 0;
        this.reconnectAttempts = 1;
        this.lastWSMessage = 0;
        if (!this.manager)
            this.manager = Utils_1.Structure.get("Node")._manager;
        if (!this.manager)
            throw new RangeError("Manager has not been initiated.");
        if (this.manager.nodes.has(options.identifier || options.host))
            return this.manager.nodes.get(options.identifier || options.host);
        (0, NodeCheck_1.default)(options);
        this.options = Object.assign({ port: 2333, password: "youshallnotpass", secure: false, retryAmount: Infinity, retryDelay: 1000, search: true, playback: true, version: "v4" }, options);
        if (this.options.secure)
            this.options.port = 443;
        this.options.identifier = options.identifier || options.host;
        this.stats = {
            players: 0,
            playingPlayers: 0,
            uptime: 0,
            memory: { free: 0, used: 0, allocated: 0, reservable: 0 },
            cpu: { cores: 0, systemLoad: 0, lavalinkLoad: 0 },
            frameStats: { sent: 0, nulled: 0, deficit: 0 },
        };
        this.manager.nodes.set(this.options.identifier, this);
        this.manager.emit("nodeCreate", this);
        if (this.options.version === "v4")
            this.rest = new V4RestHandler_1.V4RestHandler(this);
        else
            this.rest = new V3RestHandler_1.V3RestHandler(this);
        setInterval(() => {
            if (this.connected && this.lastWSMessage + 300000 < Date.now()) {
                this.destroy();
                this.manager.createNode(this.options).connect();
            }
        }, 12000);
    }
    connect() {
        var _a;
        if (this.connected)
            return;
        const headers = Object.assign({
            Authorization: this.options.password,
            "Num-Shards": String(this.manager.options.shards),
            "User-Id": this.manager.options.clientId,
            "Client-Name": this.manager.options.clientName,
        });
        const sessionId = this.manager.db.get(`sessionId.${(_a = this.options.identifier) !== null && _a !== void 0 ? _a : this.options.host.replace(/\./g, "-")}`);
        if (this.manager.options.autoResume && sessionId)
            headers["Session-Id"] = sessionId;
        this.socket = new ws_1.default(`ws${this.options.secure ? "s" : ""}://${this.address}/${this.options.version}/websocket`, { headers });
        this.socket.on("open", this.open.bind(this));
        this.socket.on("close", this.close.bind(this));
        this.socket.on("message", this.message.bind(this));
        this.socket.on("error", this.error.bind(this));
    }
    destroy() {
        var _a, _b;
        if (!this.connected)
            return;
        const players = this.manager.players.filter((p) => p.node == this);
        if (players.size) {
            players.map((p) => {
                if (this.manager.options.autoMove)
                    p.moveNode();
                else
                    p.destroy();
            });
        }
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.close(1000, "destroy");
        (_b = this.socket) === null || _b === void 0 ? void 0 : _b.removeAllListeners();
        this.socket = null;
        this.reconnectAttempts = 1;
        clearTimeout(this.reconnectTimeout);
        this.manager.emit("nodeDestroy", this);
        this.manager.destroyNode(this.options.identifier);
    }
    reconnect() {
        this.reconnectTimeout = setTimeout(() => {
            var _a;
            if (this.reconnectAttempts >= this.options.retryAmount) {
                const error = new Error(`Unable to connect after ${this.options.retryAmount} attempts.`);
                this.manager.emit("nodeError", this, error);
                return this.destroy();
            }
            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
            this.socket = null;
            this.manager.emit("nodeReconnect", this);
            this.connect();
            this.reconnectAttempts++;
        }, this.options.retryDelay);
    }
    open() {
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        this.manager.emit("nodeConnect", this);
    }
    close(code, reason) {
        this.manager.emit("nodeDisconnect", this, { code, reason });
        if (code !== 1000 || reason !== "destroy")
            this.reconnect();
        this.manager.players
            .filter((p) => p.node.options.identifier === this.options.identifier)
            .forEach((p) => {
            if (!this.manager.options.autoMove)
                return (p.playing = false);
            p.moveNode();
        });
    }
    error(error) {
        if (!error)
            return;
        this.manager.emit("nodeError", this, error);
    }
    message(d) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (Array.isArray(d))
                d = Buffer.concat(d);
            else if (d instanceof ArrayBuffer)
                d = Buffer.from(d);
            const payload = JSON.parse(d.toString());
            if (!payload.op)
                return;
            this.manager.emit("nodeRaw", payload);
            this.lastWSMessage = Date.now();
            switch (payload.op) {
                case "stats":
                    delete payload.op;
                    this.stats = Object.assign({}, payload);
                    break;
                case "playerUpdate":
                    const player = this.manager.players.get(payload.guildId);
                    if (player)
                        player.position = payload.state.position || 0;
                    break;
                case "event":
                    this.handleEvent(payload);
                    break;
                case "ready":
                    this.rest.setSessionId(payload.sessionId);
                    this.sessionId = payload.sessionId;
                    const identifier = (_a = this.options.identifier) !== null && _a !== void 0 ? _a : this.options.host.replace(/\./g, "-");
                    this.manager.db.set(`sessionId.${identifier}`, this.sessionId);
                    if (!this.manager.options.autoResume)
                        return;
                    yield this.rest.patch(`/${this.options.version}/sessions/${this.sessionId}`, {
                        resuming: true,
                        timeout: 360,
                    });
                    const resumedPlayers = yield this.rest.getAllPlayers();
                    for (const resumedPlayer of resumedPlayers) {
                        if (this.manager.players["get"](resumedPlayer.guildId))
                            return;
                        const previousInfosPlayer = this.manager.db.get(`players.${resumedPlayer.guildId}`) || {};
                        if (!previousInfosPlayer.guild || !previousInfosPlayer.voiceChannel || !previousInfosPlayer.textChannel) {
                            this.manager.db.delete(`players.${resumedPlayer.guildId}`);
                            return;
                        }
                        const player = this.manager.create({
                            guild: previousInfosPlayer.guild,
                            voiceChannel: previousInfosPlayer.voiceChannel,
                            textChannel: previousInfosPlayer.textChannel,
                            volume: previousInfosPlayer.volume,
                            selfDeafen: previousInfosPlayer.selfDeafen,
                            selfMute: previousInfosPlayer.selfMute,
                            data: (_b = previousInfosPlayer.data) !== null && _b !== void 0 ? _b : {},
                            node: this.options.identifier,
                        });
                        if (!previousInfosPlayer.current)
                            return;
                        player.state = "RESUMING";
                        let decoded = yield this.manager.decodeTracks(previousInfosPlayer.queue.map((e) => e).concat(previousInfosPlayer.current));
                        player.queue.add(Utils_1.TrackUtils.build(decoded.find((t) => t.encoded === previousInfosPlayer.current)));
                        if (previousInfosPlayer.queue.length > 0) {
                            player.queue.add(decoded.filter((t) => t.encoded !== previousInfosPlayer.current).map((trackData) => Utils_1.TrackUtils.build(trackData)));
                        }
                        player.filters.distortion = resumedPlayer.filters.distortion;
                        player.filters.equalizer = resumedPlayer.filters.equalizer;
                        player.filters.karaoke = resumedPlayer.filters.karaoke;
                        player.filters.rotation = resumedPlayer.filters.rotation;
                        player.filters.timescale = resumedPlayer.filters.timescale;
                        player.filters.vibrato = resumedPlayer.filters.vibrato;
                        player.filters.volume = resumedPlayer.filters.volume;
                        player.volume = resumedPlayer.volume;
                        player.position = resumedPlayer.state.position;
                        player.connect();
                        yield player.node.rest.updatePlayer({
                            guildId: player.guild,
                            data: {
                                encodedTrack: (_c = player.queue.current) === null || _c === void 0 ? void 0 : _c.track,
                                volume: player.volume,
                                position: resumedPlayer.state.position,
                                paused: player.paused,
                                filters: {
                                    distortion: player.filters.distortion,
                                    equalizer: player.filters.equalizer,
                                    karaoke: player.filters.karaoke,
                                    rotation: player.filters.rotation,
                                    timescale: player.filters.timescale,
                                    vibrato: player.filters.vibrato,
                                    volume: player.filters.volume,
                                },
                            },
                        });
                    }
                    break;
                default:
                    this.manager.emit("nodeError", this, new Error(`Unexpected op "${payload.op}" with data: ${payload.message}`));
                    return;
            }
        });
    }
    handleEvent(payload) {
        var _a;
        if (!payload.guildId)
            return;
        const player = this.manager.players.get(payload.guildId);
        if (!player)
            return;
        const track = player.queue.current;
        const type = payload.type;
        switch (type) {
            case "TrackStartEvent":
                this.trackStart(player, track, payload);
                break;
            case "TrackEndEvent":
                if ((player === null || player === void 0 ? void 0 : player.nowPlayingMessage) && !((_a = player === null || player === void 0 ? void 0 : player.nowPlayingMessage) === null || _a === void 0 ? void 0 : _a.deleted)) {
                    player.nowPlayingMessage.delete().catch(() => { });
                }
                player.save();
                this.trackEnd(player, track, payload);
                break;
            case "TrackStuckEvent":
                this.trackStuck(player, track, payload);
                break;
            case "TrackExceptionEvent":
                this.trackError(player, track, payload);
                break;
            case "WebSocketClosedEvent":
                this.socketClosed(player, payload);
                break;
            default:
                const error = new Error(`Node#event unknown event '${type}'.`);
                this.manager.emit("nodeError", this, error);
                break;
        }
    }
    trackStart(player, track, payload) {
        player.playing = true;
        player.paused = false;
        this.manager.emit("trackStart", player, track, payload);
    }
    trackEnd(player, track, payload) {
        if (player.state === "MOVING" || player.state === "RESUMING")
            return;
        const { reason } = payload;
        if (["loadFailed", "cleanup"].includes(reason)) {
            player.queue.previous = player.queue.current;
            player.queue.current = player.queue.shift();
            if (!player.queue.current) {
                this.queueEnd(player, track, payload);
                return;
            }
            this.manager.emit("trackEnd", player, track, payload);
            if (this.manager.options.autoPlay)
                player.play();
        }
        else if (reason === "replaced") {
            this.manager.emit("trackEnd", player, track, payload);
            player.queue.previous = player.queue.current;
        }
        else if (track && (player.trackRepeat || player.queueRepeat)) {
            const { queue, trackRepeat, queueRepeat } = player;
            const { autoPlay } = this.manager.options;
            if (trackRepeat) {
                queue.unshift(queue.current);
            }
            else if (queueRepeat) {
                queue.add(queue.current);
            }
            queue.previous = queue.current;
            queue.current = queue.shift();
            this.manager.emit("trackEnd", player, track, payload);
            if (payload.reason === "stopped" && !(queue.current = queue.shift())) {
                this.queueEnd(player, track, payload);
                return;
            }
            if (autoPlay)
                player.play();
        }
        else if (player.queue.length) {
            player.queue.previous = player.queue.current;
            player.queue.current = player.queue.shift();
            this.manager.emit("trackEnd", player, track, payload);
            if (this.manager.options.autoPlay)
                player.play();
        }
        else
            this.queueEnd(player, track, payload);
    }
    queueEnd(player, track, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            player.queue.current = null;
            player.playing = player.isAutoplay;
            if (player.isAutoplay)
                return yield this.handleAutoplay(player, track);
            this.manager.emit("queueEnd", player, track, payload);
        });
    }
    trackStuck(player, track, payload) {
        this.manager.emit("trackStuck", player, track, payload);
    }
    trackError(player, track, payload) {
        this.manager.emit("trackError", player, track, payload);
    }
    socketClosed(player, payload) {
        this.manager.emit("socketClosed", player, payload);
    }
    handleAutoplay(player, track) {
        return __awaiter(this, void 0, void 0, function* () {
            const base = "https://www.youtube.com/watch?v=H58vbez_m4E";
            const getMixUrl = (identifier) => `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
            const findMix = () => __awaiter(this, void 0, void 0, function* () {
                let mixUrl;
                let response;
                let base_response;
                const previousTrack = player.queue.previous || track;
                base_response = yield player.search({
                    query: `${previousTrack.title} - ${previousTrack.author}`,
                    source: "youtube",
                }, previousTrack.requester);
                mixUrl = getMixUrl(previousTrack.sourceName === "youtube" ? previousTrack.identifier : base_response.tracks[0].identifier);
                response = yield player.search(mixUrl, previousTrack.requester);
                if (response.loadType === "error" || response.loadType === "empty") {
                    base_response = yield player.search(base, previousTrack.requester);
                    mixUrl = getMixUrl(base_response.tracks[0].identifier);
                    response = yield player.search(mixUrl, previousTrack.requester);
                }
                return response;
            });
            const response = yield findMix();
            player.queue.add(response.playlist.tracks.filter((t) => t.uri !== track.uri)[Math.floor(Math.random() * response.playlist.tracks.length - 1)]);
            player.play();
        });
    }
}
exports.Node = Node;
//# sourceMappingURL=Node.js.map