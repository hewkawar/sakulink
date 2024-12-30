"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = playerCheck;
function playerCheck(options) {
    if (!options) {
        throw new TypeError("PlayerOptions must not be empty.");
    }
    const { guild, node, selfDeafen, selfMute, textChannel, voiceChannel, volume, } = options;
    if (!guild || typeof guild !== "string" || !/^\d+$/.test(guild)) {
        throw new TypeError('Player option "guild" must be present and be a non-empty string.');
    }
    if (node && typeof node !== "string") {
        throw new TypeError('Player option "node" must be a non-empty string.');
    }
    if (typeof selfDeafen !== "undefined" && typeof selfDeafen !== "boolean") {
        throw new TypeError('Player option "selfDeafen" must be a boolean.');
    }
    if (typeof selfMute !== "undefined" && typeof selfMute !== "boolean") {
        throw new TypeError('Player option "selfMute" must be a boolean.');
    }
    if (textChannel && typeof textChannel !== "string" && !/^\d+$/.test(textChannel)) {
        throw new TypeError('Player option "textChannel" must be a non-empty string.');
    }
    if (voiceChannel && typeof voiceChannel !== "string" && !/^\d+$/.test(voiceChannel)) {
        throw new TypeError('Player option "voiceChannel" must be a non-empty string.');
    }
    if (typeof volume !== "undefined" && typeof volume !== "number") {
        throw new TypeError('Player option "volume" must be a number.');
    }
}
//# sourceMappingURL=PlayerCheck.js.map