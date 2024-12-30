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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = exports.Structure = exports.TrackUtils = exports.SIZES = exports.UNRESOLVED_TRACK_SYMBOL = exports.TRACK_SYMBOL = void 0;
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
exports.TRACK_SYMBOL = Symbol("track");
exports.UNRESOLVED_TRACK_SYMBOL = Symbol("unresolved");
exports.SIZES = ["0", "1", "2", "3", "default", "mqdefault", "hqdefault", "maxresdefault"];
class TrackUtils {
    static init(manager) {
        this.manager = manager;
    }
    static setTrackPartial(partial) {
        if (!Array.isArray(partial) || !partial.every((str) => typeof str === "string"))
            throw new Error("Provided partial is not an array or not a string array.");
        if (!partial.includes("track"))
            partial.unshift("track");
        this.trackPartial = partial;
    }
    static validate(trackOrTracks) {
        if (typeof trackOrTracks === "undefined")
            throw new RangeError("Provided argument must be present.");
        if (Array.isArray(trackOrTracks) && trackOrTracks.length) {
            for (const track of trackOrTracks) {
                if (!(track[exports.TRACK_SYMBOL] || track[exports.UNRESOLVED_TRACK_SYMBOL]))
                    return false;
            }
            return true;
        }
        return (trackOrTracks[exports.TRACK_SYMBOL] || trackOrTracks[exports.UNRESOLVED_TRACK_SYMBOL]) === true;
    }
    static isTrack(track) {
        if (typeof track === "undefined")
            throw new RangeError("Provided argument must be present.");
        return track[exports.TRACK_SYMBOL] === true;
    }
    static isUnresolvedTrack(track) {
        if (typeof track === "undefined")
            throw new RangeError("Provided argument must be present.");
        return track[exports.UNRESOLVED_TRACK_SYMBOL] === true;
    }
    static build(data, requester) {
        var _a, _b;
        if (typeof data === "undefined")
            throw new RangeError("Argument 'data' must be present.");
        try {
            const track = {
                track: data.encoded,
                title: data.info.title,
                identifier: data.info.identifier,
                author: data.info.author,
                duration: data.info.length,
                isSeekable: data.info.isSeekable,
                isStream: data.info.isStream,
                uri: data.info.uri,
                artworkUrl: (_a = data.info) === null || _a === void 0 ? void 0 : _a.artworkUrl,
                sourceName: (_b = data.info) === null || _b === void 0 ? void 0 : _b.sourceName,
                thumbnail: data.info.uri.includes("youtube") ? `https://img.youtube.com/vi/${data.info.identifier}/default.jpg` : null,
                displayThumbnail(size = "default") {
                    var _a;
                    const finalSize = (_a = exports.SIZES.find((s) => s === size)) !== null && _a !== void 0 ? _a : "default";
                    return this.uri.includes("youtube") ? `https://img.youtube.com/vi/${data.info.identifier}/${finalSize}.jpg` : null;
                },
                requester,
            };
            track.displayThumbnail = function (size = "default") {
                var _a;
                const finalSize = (_a = exports.SIZES.find((s) => s === size)) !== null && _a !== void 0 ? _a : "default";
                return this.uri.includes("youtube") ? `https://img.youtube.com/vi/${data.info.identifier}/${finalSize}.jpg` : null;
            }.bind(track);
            if (this.trackPartial) {
                for (const key of Object.keys(track)) {
                    if (this.trackPartial.includes(key))
                        continue;
                    delete track[key];
                }
            }
            Object.defineProperty(track, exports.TRACK_SYMBOL, {
                configurable: true,
                value: true,
            });
            return track;
        }
        catch (error) {
            throw new RangeError(`Argument "data" is not a valid track: ${error.message}`);
        }
    }
    static buildUnresolved(query, requester) {
        if (typeof query === "undefined")
            throw new RangeError("Argument 'query' must be present.");
        let unresolvedTrack = {
            requester,
            resolve() {
                return __awaiter(this, void 0, void 0, function* () {
                    const resolved = yield TrackUtils.getClosestTrack(this);
                    Object.getOwnPropertyNames(this).forEach((prop) => delete this[prop]);
                    Object.assign(this, resolved);
                });
            },
        };
        if (typeof query === "string")
            unresolvedTrack.title = query;
        else
            unresolvedTrack = Object.assign(Object.assign({}, unresolvedTrack), query);
        Object.defineProperty(unresolvedTrack, exports.UNRESOLVED_TRACK_SYMBOL, {
            configurable: true,
            value: true,
        });
        return unresolvedTrack;
    }
    static getClosestTrack(unresolvedTrack) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!TrackUtils.manager)
                throw new RangeError("Manager has not been initiated.");
            if (!TrackUtils.isUnresolvedTrack(unresolvedTrack))
                throw new RangeError("Provided track is not a UnresolvedTrack.");
            const query = [unresolvedTrack.author, unresolvedTrack.title].filter((str) => !!str).join(" - ");
            const res = yield TrackUtils.manager.search(query, unresolvedTrack.requester);
            if (unresolvedTrack.author) {
                const channelNames = [unresolvedTrack.author, `${unresolvedTrack.author} - Topic`];
                const originalAudio = res.tracks.find((track) => {
                    return channelNames.some((name) => new RegExp(`^${escapeRegExp(name)}$`, "i").test(track.author)) || new RegExp(`^${escapeRegExp(unresolvedTrack.title)}$`, "i").test(track.title);
                });
                if (originalAudio)
                    return originalAudio;
            }
            if (unresolvedTrack.duration) {
                const sameDuration = res.tracks.find((track) => track.duration >= unresolvedTrack.duration - 1500 && track.duration <= unresolvedTrack.duration + 1500);
                if (sameDuration)
                    return sameDuration;
            }
            return res.tracks[0];
        });
    }
}
exports.TrackUtils = TrackUtils;
TrackUtils.trackPartial = null;
class Structure {
    static extend(name, extender) {
        if (!structures[name])
            throw new TypeError(`"${name}" is not a valid structure`);
        const extended = extender(structures[name]);
        structures[name] = extended;
        return extended;
    }
    static get(name) {
        const structure = structures[name];
        if (!structure)
            throw new TypeError('"structure" must be provided.');
        return structure;
    }
}
exports.Structure = Structure;
class Plugin {
    load(manager) { }
    unload(manager) { }
}
exports.Plugin = Plugin;
const structures = {
    Player: require("./Player").Player,
    Queue: require("./Queue").Queue,
    Node: require("./Node").Node,
};
//# sourceMappingURL=Utils.js.map