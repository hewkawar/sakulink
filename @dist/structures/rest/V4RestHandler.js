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
exports.V4RestHandler = void 0;
const axios_1 = __importDefault(require("axios"));
class V4RestHandler {
    constructor(node) {
        this.node = node;
        this.url = `http${node.options.secure ? "s" : ""}://${node.options.host}:${node.options.port}`;
        this.sessionId = node.sessionId;
        this.password = node.options.password;
    }
    setSessionId(sessionId) {
        this.sessionId = sessionId;
        return this.sessionId;
    }
    getAllPlayers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.get(`/v4/sessions/${this.sessionId}/players`);
        });
    }
    updatePlayer(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.patch(`/v4/sessions/${this.sessionId}/players/${options.guildId}?noReplace=false`, options.data);
        });
    }
    destroyPlayer(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.delete(`/v4/sessions/${this.sessionId}/players/${guildId}`);
        });
    }
    request(method, endpoint, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, axios_1.default)({
                    method,
                    data: body,
                    cache: false,
                    url: this.url + endpoint,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: this.password,
                    },
                });
                return response.data;
            }
            catch (e) {
                return null;
            }
        });
    }
    get(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request("GET", endpoint);
        });
    }
    patch(endpoint, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request("PATCH", endpoint, body);
        });
    }
    post(endpoint, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request("POST", endpoint, body);
        });
    }
    delete(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request("DELETE", endpoint);
        });
    }
}
exports.V4RestHandler = V4RestHandler;
//# sourceMappingURL=V4RestHandler.js.map