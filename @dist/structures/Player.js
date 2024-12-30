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
exports.Player = void 0;
const Filters_1 = require("./Filters");
const Utils_1 = require("./Utils");
const lodash_1 = __importDefault(require("lodash"));
const PlayerCheck_1 = __importDefault(require("../utils/PlayerCheck"));
class Player {
    set(key, value) {
        this.data[key] = value;
    }
    get(key) {
        return this.data[key];
    }
    static init(manager) {
        this._manager = manager;
    }
    constructor(options) {
        var _a, _b;
        this.options = options;
        this.queue = new (Utils_1.Structure.get("Queue"))();
        this.trackRepeat = false;
        this.queueRepeat = false;
        this.dynamicRepeat = false;
        this.position = 0;
        this.playing = false;
        this.paused = false;
        this.isAutoplay = false;
        this.voiceChannel = null;
        this.textChannel = null;
        this.state = "DISCONNECTED";
        this.bands = new Array(15).fill(0.0);
        this.data = {};
        if (!this.manager)
            this.manager = Utils_1.Structure.get("Player")._manager;
        if (!this.manager)
            throw new RangeError("Manager has not been initiated.");
        if (this.manager.players.has(options.guild))
            return this.manager.players.get(options.guild);
        (0, PlayerCheck_1.default)(options);
        this.guild = options.guild;
        this.data = (_a = options.data) !== null && _a !== void 0 ? _a : {};
        this.voiceState = Object.assign({
            op: "voiceUpdate",
            guild_id: options.guild,
        });
        if (options.voiceChannel)
            this.voiceChannel = options.voiceChannel;
        if (options.textChannel)
            this.textChannel = options.textChannel;
        const node = this.manager.nodes.get(options.node);
        this.node = node || this.manager.leastLoadNodes.filter((node) => node.options.playback).first();
        if (!this.node)
            throw new RangeError("No available nodes.");
        this.manager.players.set(options.guild, this);
        this.manager.emit("playerCreate", this);
        this.volume = (_b = options.volume) !== null && _b !== void 0 ? _b : 80;
        this.filters = new Filters_1.Filters(this);
    }
    search(query, requester) {
        return this.manager.search(query, requester);
    }
    connect() {
        if (!this.voiceChannel)
            throw new RangeError("No voice channel has been set.");
        this.state = "CONNECTING";
        this.manager.options.send(this.guild, {
            op: 4,
            d: {
                guild_id: this.guild,
                channel_id: this.voiceChannel,
                self_mute: this.options.selfMute || false,
                self_deaf: this.options.selfDeafen || false,
            },
        });
        this.state = "CONNECTED";
        return this;
    }
    disconnect() {
        if (this.voiceChannel === null)
            return this;
        this.state = "DISCONNECTING";
        this.manager.options.send(this.guild, {
            op: 4,
            d: {
                guild_id: this.guild,
                channel_id: null,
                self_mute: false,
                self_deaf: false,
            },
        });
        this.voiceChannel = null;
        this.state = "DISCONNECTED";
        return this;
    }
    destroy(disconnect = true) {
        this.state = "DESTROYING";
        if (disconnect)
            this.disconnect();
        this.node.rest.destroyPlayer(this.guild);
        this.manager.emit("playerDestroy", this);
        this.manager.players.delete(this.guild);
        this.manager.db.delete(`players.${this.guild}`);
    }
    setVoiceChannel(channel) {
        if (typeof channel !== "string")
            throw new TypeError("Channel must be a non-empty string.");
        this.voiceChannel = channel;
        this.connect();
        return this;
    }
    setTextChannel(channel) {
        if (typeof channel !== "string")
            throw new TypeError("Channel must be a non-empty string.");
        this.textChannel = channel;
        return this;
    }
    moveNode(node) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (node)
                node = node;
            else
                node = (_a = this.manager.leastLoadNodes.filter((node) => node.options.playback).first()) === null || _a === void 0 ? void 0 : _a.options.identifier;
            if (!node)
                this.destroy();
            if (!this.manager.nodes.has(node))
                throw new RangeError("No nodes available.");
            if (this.node.options.identifier === node)
                return this;
            const destroyOldNode = (node) => __awaiter(this, void 0, void 0, function* () {
                this.state = "MOVING";
                if (this.manager.nodes.get(node.options.identifier) && this.manager.nodes.get(node.options.identifier).connected)
                    yield node.rest.destroyPlayer(this.guild);
                setTimeout(() => (this.state = "CONNECTED"), 5000);
            });
            const currentNode = this.node;
            const destinationNode = this.manager.nodes.get(node);
            let position = this.position;
            if (currentNode.connected) {
                const fetchedPlayer = yield currentNode.rest.get(`/${currentNode.options.version}/sessions/${currentNode.sessionId}/players/${this.guild}`);
                position = fetchedPlayer.track.info.position;
            }
            yield destinationNode.rest.updatePlayer({
                guildId: this.guild,
                data: {
                    encodedTrack: (_b = this.queue.current) === null || _b === void 0 ? void 0 : _b.track,
                    position: position,
                    volume: this.volume,
                    paused: this.paused,
                    filters: {
                        distortion: this.filters.distortion,
                        equalizer: this.filters.equalizer,
                        karaoke: this.filters.karaoke,
                        rotation: this.filters.rotation,
                        timescale: this.filters.timescale,
                        vibrato: this.filters.vibrato,
                        volume: this.filters.volume,
                    },
                },
            });
            yield destinationNode.rest.updatePlayer({
                guildId: this.guild,
                data: {
                    voice: {
                        token: this.voiceState.event.token,
                        endpoint: this.voiceState.event.endpoint,
                        sessionId: (_c = this.voiceState) === null || _c === void 0 ? void 0 : _c.sessionId,
                    },
                },
            });
            this.node = destinationNode;
            destroyOldNode(currentNode);
            return this;
        });
    }
    setNowPlayingMessage(message) {
        if (!message) {
            throw new TypeError("You must provide the message of the now playing message.");
        }
        return (this.nowPlayingMessage = message);
    }
    play(optionsOrTrack, playOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (typeof optionsOrTrack !== "undefined" && Utils_1.TrackUtils.validate(optionsOrTrack)) {
                if (this.queue.current)
                    this.queue.previous = this.queue.current;
                this.queue.current = optionsOrTrack;
            }
            if (!this.queue.current)
                throw new RangeError("No current track.");
            const finalOptions = playOptions ? playOptions : ["startTime", "endTime", "noReplace"].every((v) => Object.keys(optionsOrTrack || {}).includes(v)) ? optionsOrTrack : {};
            if (Utils_1.TrackUtils.isUnresolvedTrack(this.queue.current)) {
                try {
                    this.queue.current = yield Utils_1.TrackUtils.getClosestTrack(this.queue.current);
                }
                catch (error) {
                    this.manager.emit("trackError", this, this.queue.current, error);
                    if (this.queue[0])
                        return this.play(this.queue[0]);
                    return;
                }
            }
            yield this.node.rest.updatePlayer({
                guildId: this.guild,
                data: Object.assign({ encodedTrack: (_a = this.queue.current) === null || _a === void 0 ? void 0 : _a.track, volume: this.volume }, finalOptions),
            });
            Object.assign(this, { position: 0, playing: true });
            this.save();
        });
    }
    setVolume(volume) {
        if (isNaN(volume))
            throw new TypeError("Volume must be a number.");
        this.node.rest.updatePlayer({
            guildId: this.options.guild,
            data: {
                volume,
            },
        });
        this.volume = volume;
        return this;
    }
    setAutoplay(state) {
        if (typeof state !== "boolean") {
            throw new TypeError('state must be a "true" or "false".');
        }
        this.isAutoplay = state;
        return this;
    }
    setTrackRepeat(repeat) {
        if (typeof repeat !== "boolean")
            throw new TypeError('Repeat can only be "true" or "false".');
        if (repeat) {
            this.trackRepeat = true;
            this.queueRepeat = false;
            this.dynamicRepeat = false;
        }
        else {
            this.trackRepeat = false;
            this.queueRepeat = false;
            this.dynamicRepeat = false;
        }
        return this;
    }
    setQueueRepeat(repeat) {
        if (typeof repeat !== "boolean")
            throw new TypeError('Repeat can only be "true" or "false".');
        if (repeat) {
            this.trackRepeat = false;
            this.queueRepeat = true;
            this.dynamicRepeat = false;
        }
        else {
            this.trackRepeat = false;
            this.queueRepeat = false;
            this.dynamicRepeat = false;
        }
        return this;
    }
    setDynamicRepeat(repeat, ms) {
        if (typeof repeat !== "boolean") {
            throw new TypeError('Repeat can only be "true" or "false".');
        }
        if (this.queue.size <= 1) {
            throw new RangeError("The queue size must be greater than 1.");
        }
        if (repeat) {
            this.trackRepeat = false;
            this.queueRepeat = false;
            this.dynamicRepeat = true;
            this.dynamicLoopInterval = setInterval(() => {
                if (!this.dynamicRepeat)
                    return;
                let shuffled = lodash_1.default.shuffle(this.queue);
                this.queue.clear();
                shuffled.forEach((track) => {
                    this.queue.add(track);
                });
            }, ms);
        }
        else {
            clearInterval(this.dynamicLoopInterval);
            this.trackRepeat = false;
            this.queueRepeat = false;
            this.dynamicRepeat = false;
        }
        return this;
    }
    restart() {
        var _a, _b;
        if (!((_a = this.queue.current) === null || _a === void 0 ? void 0 : _a.track)) {
            if (this.queue.length)
                this.play();
            return;
        }
        this.node.rest.updatePlayer({
            guildId: this.guild,
            data: {
                position: 0,
                encodedTrack: (_b = this.queue.current) === null || _b === void 0 ? void 0 : _b.track,
            },
        });
    }
    stop(amount) {
        if (typeof amount === "number" && amount > 1) {
            if (amount > this.queue.length)
                throw new RangeError("Cannot skip more than the queue length.");
            this.queue.splice(0, amount - 1);
        }
        this.node.rest.updatePlayer({
            guildId: this.guild,
            data: {
                encodedTrack: null,
            },
        });
        return this;
    }
    pause(pause) {
        if (typeof pause !== "boolean")
            throw new RangeError('Pause can only be "true" or "false".');
        if (this.paused === pause || !this.queue.totalSize)
            return this;
        this.playing = !pause;
        this.paused = pause;
        this.node.rest.updatePlayer({
            guildId: this.guild,
            data: {
                paused: pause,
            },
        });
        return this;
    }
    previous() {
        this.queue.unshift(this.queue.previous);
        this.stop();
        return this;
    }
    skip() {
        const nextTrack = this.queue.shift();
        if (!nextTrack)
            this.stop();
        this.queue.current = nextTrack;
        this.node.rest.updatePlayer({
            guildId: this.guild,
            data: {
                encodedTrack: nextTrack.track
            }
        });
        return this;
    }
    seek(position) {
        if (!this.queue.current)
            return undefined;
        position = Number(position);
        if (isNaN(position)) {
            throw new RangeError("Position must be a number.");
        }
        if (position < 0 || position > this.queue.current.duration)
            position = Math.max(Math.min(position, this.queue.current.duration), 0);
        this.position = position;
        this.node.rest.updatePlayer({
            guildId: this.guild,
            data: {
                position: position,
            },
        });
        return this;
    }
    save() {
        if (!this.manager.options.autoResume)
            return;
        this.manager.db.set(`players.${this.guild}`, {
            guild: this.guild,
            voiceChannel: this.voiceChannel,
            textChannel: this.textChannel,
            volume: this.volume,
            data: this.data,
            selfDeafen: this.options.selfDeafen,
            selfMute: this.options.selfMute,
            isAutoplay: this.isAutoplay,
            current: this.queue.current ? this.queue.current.track : null,
            queue: this.queue.map((track) => track.track),
        });
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map