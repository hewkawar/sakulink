"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Database {
    constructor(clientId, shards) {
        this.data = {};
        this.fetch();
        this.id = clientId;
        this.shards = shards;
    }
    set(key, value) {
        if (!key)
            throw new Error('"key" is empty');
        const keys = key.split(".");
        if (keys.length === 0)
            return;
        this.updateData(this.data, keys, value);
        this.save();
    }
    get(key) {
        var _a;
        if (!key)
            throw new Error('"key" is empty');
        if (Object.keys(this.data).length === 0)
            this.fetch();
        return (_a = key.split(".").reduce((acc, curr) => acc === null || acc === void 0 ? void 0 : acc[curr], this.data)) !== null && _a !== void 0 ? _a : null;
    }
    push(key, value) {
        if (!key)
            throw new Error('"key" is empty');
        const oldArray = this.get(key) || [];
        if (!Array.isArray(oldArray))
            throw new Error("Key does not point to an array");
        oldArray.push(value);
        this.set(key, oldArray);
    }
    delete(key) {
        if (!key)
            throw new Error('"key" is empty');
        const keys = key.split(".");
        if (keys.length === 0)
            return false;
        const lastKey = keys.pop() || "";
        let currentObj = this.data;
        keys.map((k) => {
            if (typeof currentObj[k] === "object")
                currentObj = currentObj[k];
            else
                throw new Error(`Key path "${key}" does not exist`);
        });
        if (currentObj && lastKey in currentObj) {
            delete currentObj[lastKey];
            this.save();
            return true;
        }
        return false;
    }
    updateData(data, keys, value) {
        let currentObj = data;
        keys.forEach((key, index) => {
            if (index === keys.length - 1)
                currentObj[key] = value;
            else {
                if (typeof currentObj[key] !== "object")
                    currentObj[key] = {};
                currentObj = currentObj[key];
            }
        });
    }
    getFilePath() {
        return path_1.default.join(__dirname, "../datastore", `database-${this.shards}-${this.id}.json`);
    }
    fetch() {
        try {
            const directory = path_1.default.join(__dirname, "../datastore");
            if (!fs_1.default.existsSync(directory)) {
                fs_1.default.mkdirSync(directory, { recursive: true });
            }
            const filePath = this.getFilePath();
            const rawData = fs_1.default.readFileSync(filePath, "utf-8");
            this.data = JSON.parse(rawData) || {};
        }
        catch (err) {
            if (err.code === "ENOENT") {
                this.data = {};
            }
            else {
                throw new Error("Failed to fetch data");
            }
        }
    }
    save() {
        try {
            const filePath = this.getFilePath();
            fs_1.default.writeFileSync(filePath, JSON.stringify(this.data));
        }
        catch (error) {
            throw new Error("Failed to save data");
        }
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map