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
exports.Manager = exports.REQUIRED_PAYLOAD_KEYS = exports.REQUIRED_KEYS = void 0;
const Utils_1 = require("./Utils");
const collection_1 = require("@discordjs/collection");
const events_1 = require("events");
const __1 = require("..");
const Database_1 = require("../utils/Database");
const ManagerCheck_1 = __importDefault(require("../utils/ManagerCheck"));
exports.REQUIRED_KEYS = ["event", "guild_id", "op", "sessionId"];
exports.REQUIRED_PAYLOAD_KEYS = exports.REQUIRED_KEYS;
class Manager extends events_1.EventEmitter {
    get leastUsedNodes() {
        return this.nodes.filter((node) => node.connected).sort((a, b) => a.stats.playingPlayers - b.stats.playingPlayers);
    }
    get leastLoadNodes() {
        return this.nodes
            .filter((node) => node.connected)
            .sort((a, b) => {
            const aload = a.stats.cpu ? (a.stats.cpu.lavalinkLoad / a.stats.cpu.cores) * 100 : 0;
            const bload = b.stats.cpu ? (b.stats.cpu.lavalinkLoad / b.stats.cpu.cores) * 100 : 0;
            return aload - bload;
        });
    }
    constructor(options) {
        super();
        this.players = new collection_1.Collection();
        this.nodes = new collection_1.Collection();
        this.db = null;
        this.initiated = false;
        (0, ManagerCheck_1.default)(options);
        Utils_1.Structure.get("Player").init(this);
        Utils_1.Structure.get("Node").init(this);
        Utils_1.TrackUtils.init(this);
        if (options.trackPartial) {
            Utils_1.TrackUtils.setTrackPartial(options.trackPartial);
            delete options.trackPartial;
        }
        this.options = Object.assign({ plugins: [], nodes: [], autoPlay: true, clientName: `Sakulink/${__1.version} (https://github.com/JirayuSrisawat-Github/sakulink)`, defaultSearchPlatform: "youtube music", autoMove: true, autoResume: true, shards: 0 }, options);
        if (this.options.plugins) {
            for (const [index, plugin] of this.options.plugins.entries()) {
                if (!(plugin instanceof Utils_1.Plugin))
                    throw new RangeError(`Plugin at index ${index} does not extend Plugin.`);
                plugin.load(this);
            }
        }
        if (this.options.nodes) {
            for (const nodeOptions of this.options.nodes)
                new (Utils_1.Structure.get("Node"))(nodeOptions);
        }
    }
    init(clientId) {
        var _a;
        if (this.initiated)
            return this;
        if (typeof clientId !== "undefined")
            this.options.clientId = clientId;
        if (typeof this.options.clientId !== "string")
            throw new Error('"clientId" set is not type of "string"');
        if (!this.options.clientId)
            throw new Error('"clientId" is not set. Pass it in Manager#init() or as a option in the constructor.');
        this.db = new Database_1.Database(this.options.clientId, ((_a = this.options.shards) !== null && _a !== void 0 ? _a : 0));
        for (const node of this.nodes.values()) {
            try {
                node.connect();
            }
            catch (err) {
                this.emit("nodeError", node, err);
            }
        }
        this.initiated = true;
        return this;
    }
    search(query, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const node = this.nodes.filter((node) => node.connected && node.options.search).size > 0 ? this.nodes.filter((node) => node.connected && node.options.search).first() : this.leastLoadNodes.first();
            if (!node)
                throw new Error("No available nodes.");
            const _query = typeof query === "string" ? { query } : query;
            const _source = (_b = Manager.DEFAULT_SOURCES[(_a = _query.source) !== null && _a !== void 0 ? _a : this.options.defaultSearchPlatform]) !== null && _b !== void 0 ? _b : _query.source;
            let search = _query.query;
            if (!/^https?:\/\//.test(search))
                search = `${_source}:${search}`;
            try {
                const res = (yield node.rest.get(`/${node.options.version}/loadtracks?identifier=${encodeURIComponent(search)}`));
                if (!res) {
                    throw new Error("Query not found.");
                }
                let searchData = [];
                let playlistData;
                let errorData;
                switch (res.loadType) {
                    case "search":
                        searchData = res.data;
                        break;
                    case "track":
                        searchData = [res.data];
                        break;
                    case "playlist":
                        playlistData = res.data;
                        break;
                    case "error":
                        errorData = res.data;
                }
                const tracks = searchData.map((track) => Utils_1.TrackUtils.build(track, requester));
                const playlist = res.loadType === "playlist"
                    ? {
                        name: playlistData.info.name,
                        tracks: playlistData.tracks.map((track) => Utils_1.TrackUtils.build(track, requester)),
                        duration: playlistData.tracks.reduce((acc, cur) => acc + (cur.info.length || 0), 0),
                        url: playlistData.pluginInfo.url,
                    }
                    : null;
                const result = {
                    loadType: res.loadType,
                    tracks: tracks || playlistData.tracks.map((track) => Utils_1.TrackUtils.build(track, requester)),
                    playlist,
                    error: errorData
                };
                return result;
            }
            catch (err) {
                throw new Error(err);
            }
        });
    }
    decodeTracks(tracks) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const node = this.nodes.filter((node) => node.connected && node.options.search).size > 0 ? this.nodes.filter((node) => node.connected && node.options.search).first() : this.leastLoadNodes.first();
            if (!node)
                throw new Error("No available nodes.");
            const res = (yield node.rest.post(`/${node.options.version}/decodetracks`, JSON.stringify(tracks)).catch((err) => reject(err)));
            if (!res) {
                return reject(new Error("No data returned from query."));
            }
            return resolve(res);
        }));
    }
    decodeTrack(track) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.decodeTracks([track]);
            return res[0];
        });
    }
    create(options) {
        if (this.players.has(options.guild))
            return this.players.get(options.guild);
        return new (Utils_1.Structure.get("Player"))(options);
    }
    get(guild) {
        return this.players.get(guild);
    }
    destroy(guild) {
        this.players.delete(guild);
    }
    createNode(options) {
        if (this.nodes.has(options.identifier || options.host)) {
            return this.nodes.get(options.identifier || options.host);
        }
        return new (Utils_1.Structure.get("Node"))(options);
    }
    destroyNode(identifier) {
        const node = this.nodes.get(identifier);
        if (!node)
            return;
        node.destroy();
        this.nodes.delete(identifier);
    }
    updateVoiceState(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if ("t" in data && !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(data.t))
                return;
            const voiceState = "d" in data ? data.d : data;
            if (!voiceState || (!("token" in voiceState) && !("session_id" in voiceState)))
                return;
            const player = this.players.get(voiceState.guild_id);
            if (!player)
                return;
            if ("token" in voiceState) {
                player.voiceState.event = voiceState;
                yield player.node.rest.updatePlayer({
                    guildId: player.guild,
                    data: {
                        voice: {
                            token: voiceState.token,
                            endpoint: voiceState.endpoint,
                            sessionId: player.voiceState.sessionId,
                        },
                    },
                });
            }
            else {
                if (voiceState.user_id !== this.options.clientId)
                    return;
                if (voiceState.channel_id) {
                    if (player.voiceChannel !== voiceState.channel_id)
                        this.emit("playerMove", player, player.voiceChannel, voiceState.channel_id);
                    player.voiceState.sessionId = voiceState.session_id;
                    player.voiceChannel = voiceState.channel_id;
                }
                else {
                    this.emit("playerDisconnect", player, player.voiceChannel);
                    player.voiceChannel = null;
                    player.voiceState = Object.assign({});
                    player.destroy();
                }
            }
        });
    }
}
exports.Manager = Manager;
Manager.DEFAULT_SOURCES = {
    "youtube music": "ytmsearch",
    youtube: "ytsearch",
    soundcloud: "scsearch",
    deezer: "dzsearch",
};
//# sourceMappingURL=Manager.js.map