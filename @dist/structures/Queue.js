"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const Utils_1 = require("./Utils");
class Queue extends Array {
    constructor() {
        super(...arguments);
        this.current = null;
        this.previous = null;
    }
    get totalSize() {
        return this.length + (this.current ? 1 : 0);
    }
    get size() {
        return this.totalSize;
    }
    get duration() {
        var _a, _b;
        const current = (_b = (_a = this.current) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 0;
        return this.reduce((acc, cur) => acc + (cur.duration || 0), current);
    }
    add(track, offset) {
        if (!Utils_1.TrackUtils.validate(track)) {
            throw new RangeError('Track must be a "Track" or "Track[]".');
        }
        if (!this.current) {
            if (Array.isArray(track)) {
                this.current = track.shift() || null;
                this.push(...track);
            }
            else {
                this.current = track;
            }
        }
        else {
            if (typeof offset !== "undefined" && typeof offset === "number") {
                if (isNaN(offset)) {
                    throw new RangeError("Offset must be a number.");
                }
                if (offset < 0 || offset > this.length) {
                    throw new RangeError(`Offset must be between 0 and ${this.length}.`);
                }
                if (Array.isArray(track)) {
                    this.splice(offset, 0, ...track);
                }
                else {
                    this.splice(offset, 0, track);
                }
            }
            else {
                if (Array.isArray(track)) {
                    this.push(...track);
                }
                else {
                    this.push(track);
                }
            }
        }
    }
    remove(startOrPosition = 0, end) {
        if (typeof end !== "undefined") {
            if (isNaN(Number(startOrPosition)) || isNaN(Number(end))) {
                throw new RangeError(`Missing "start" or "end" parameter.`);
            }
            if (startOrPosition >= end || startOrPosition >= this.length) {
                throw new RangeError("Invalid start or end values.");
            }
            return this.splice(startOrPosition, end - startOrPosition);
        }
        return this.splice(startOrPosition, 1);
    }
    clear() {
        this.splice(0);
    }
    shuffle() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map