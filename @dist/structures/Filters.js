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
exports.Filters = void 0;
const FiltersEqualizers_1 = require("../utils/FiltersEqualizers");
class Filters {
    constructor(player) {
        this.distortion = null;
        this.equalizer = [];
        this.karaoke = null;
        this.player = player;
        this.rotation = null;
        this.timescale = null;
        this.vibrato = null;
        this.volume = 1.0;
        this.filterStatus = {
            bassboost: false,
            distort: false,
            eightD: false,
            karaoke: false,
            nightcore: false,
            slowmo: false,
            soft: false,
            trebleBass: false,
            tv: false,
            vaporwave: false,
        };
    }
    updateFilters() {
        return __awaiter(this, void 0, void 0, function* () {
            const { distortion, equalizer, karaoke, rotation, timescale, vibrato, volume } = this;
            yield this.player.node.rest.updatePlayer({
                data: {
                    filters: {
                        distortion,
                        equalizer,
                        karaoke,
                        rotation,
                        timescale,
                        vibrato,
                        volume,
                    },
                },
                guildId: this.player.guild,
            });
            return this;
        });
    }
    applyFilter(filter, updateFilters = true) {
        this[filter.property] = filter.value;
        if (updateFilters) {
            this.updateFilters();
        }
        return this;
    }
    setFilterStatus(filter, status) {
        this.filterStatus[filter] = status;
        return this;
    }
    setEqualizer(bands) {
        return this.applyFilter({ property: "equalizer", value: bands });
    }
    eightD() {
        return this.setRotation({ rotationHz: 0.2 }).setFilterStatus("eightD", true);
    }
    bassBoost() {
        return this.setEqualizer(FiltersEqualizers_1.bassBoostEqualizer).setFilterStatus("bassboost", true);
    }
    nightcore() {
        return this.setTimescale({
            speed: 1.1,
            pitch: 1.125,
            rate: 1.05,
        }).setFilterStatus("nightcore", true);
    }
    slowmo() {
        return this.setTimescale({
            speed: 0.7,
            pitch: 1.0,
            rate: 0.8,
        }).setFilterStatus("slowmo", true);
    }
    soft() {
        return this.setEqualizer(FiltersEqualizers_1.softEqualizer).setFilterStatus("soft", true);
    }
    tv() {
        return this.setEqualizer(FiltersEqualizers_1.tvEqualizer).setFilterStatus("tv", true);
    }
    trebleBass() {
        return this.setEqualizer(FiltersEqualizers_1.trebleBassEqualizer).setFilterStatus("trebleBass", true);
    }
    vaporwave() {
        return this.setEqualizer(FiltersEqualizers_1.vaporwaveEqualizer).setTimescale({ pitch: 0.55 }).setFilterStatus("vaporwave", true);
    }
    distort() {
        return this.setDistortion({
            sinOffset: 0,
            sinScale: 0.2,
            cosOffset: 0,
            cosScale: 0.2,
            tanOffset: 0,
            tanScale: 0.2,
            offset: 0,
            scale: 1.2,
        }).setFilterStatus("distort", true);
    }
    setKaraoke(karaoke) {
        return this.applyFilter({
            property: "karaoke",
            value: karaoke,
        }).setFilterStatus("karaoke", true);
    }
    setTimescale(timescale) {
        return this.applyFilter({ property: "timescale", value: timescale });
    }
    setVibrato(vibrato) {
        return this.applyFilter({ property: "vibrato", value: vibrato });
    }
    setRotation(rotation) {
        return this.applyFilter({ property: "rotation", value: rotation });
    }
    setDistortion(distortion) {
        return this.applyFilter({ property: "distortion", value: distortion });
    }
    clearFilters() {
        return __awaiter(this, void 0, void 0, function* () {
            this.filterStatus = {
                bassboost: false,
                distort: false,
                eightD: false,
                karaoke: false,
                nightcore: false,
                slowmo: false,
                soft: false,
                trebleBass: false,
                tv: false,
                vaporwave: false,
            };
            this.player.filters = new Filters(this.player);
            this.setEqualizer([]);
            this.setDistortion(null);
            this.setKaraoke(null);
            this.setRotation(null);
            this.setTimescale(null);
            this.setVibrato(null);
            yield this.updateFilters();
            return this;
        });
    }
    getFilterStatus(filter) {
        return this.filterStatus[filter];
    }
}
exports.Filters = Filters;
//# sourceMappingURL=Filters.js.map