"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = nodeCheck;
function nodeCheck(options) {
    if (!options) {
        throw new TypeError("NodeOptions must not be empty.");
    }
    const { host, identifier, password, port, requestTimeout, retryAmount, retryDelay, secure, playback, search } = options;
    if (typeof host !== "string" || !/.+/.test(host)) {
        throw new TypeError('Node option "host" must be present and be a non-empty string.');
    }
    if (typeof identifier !== "undefined" && typeof identifier !== "string") {
        throw new TypeError('Node option "identifier" must be a non-empty string.');
    }
    if (typeof password !== "undefined" && (typeof password !== "string" || !/.+/.test(password))) {
        throw new TypeError('Node option "password" must be a non-empty string.');
    }
    if (typeof port !== "undefined" && typeof port !== "number") {
        throw new TypeError('Node option "port" must be a number.');
    }
    if (typeof requestTimeout !== "undefined" && typeof requestTimeout !== "number") {
        throw new TypeError('Node option "requestTimeout" must be a number.');
    }
    if (typeof retryAmount !== "undefined" && typeof retryAmount !== "number") {
        throw new TypeError('Node option "retryAmount" must be a number.');
    }
    if (typeof retryDelay !== "undefined" && typeof retryDelay !== "number") {
        throw new TypeError('Node option "retryDelay" must be a number.');
    }
    if (typeof secure !== "undefined" && typeof secure !== "boolean") {
        throw new TypeError('Node option "secure" must be a boolean.');
    }
    if (typeof search !== "undefined" && typeof search !== "boolean") {
        throw new TypeError('Node option "search" must be a boolean.');
    }
    if (typeof playback !== "undefined" && typeof playback !== "boolean") {
        throw new TypeError('Node option "playback" must be a boolean.');
    }
}
//# sourceMappingURL=NodeCheck.js.map