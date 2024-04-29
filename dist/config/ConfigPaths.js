"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configPaths = void 0;
const path = require("node:path");
const node_fs_1 = require("node:fs");
class ConfigPaths {
    /**
     * first find the configs directory in ./ then in ../ then in ../../
     */
    get nats() {
        const configDir = this.getConfigDir();
        return path.join(configDir, 'nats.json');
    }
    getConfigDir() {
        if (require.main) {
            let configDir = path.join(require.main.path, 'configs');
            if (!(0, node_fs_1.existsSync)(configDir))
                configDir = path.join(require.main.path, '..', 'configs');
            if (!(0, node_fs_1.existsSync)(configDir))
                configDir = path.join(require.main.path, '..', '..', 'configs');
            if ((0, node_fs_1.existsSync)(configDir))
                return configDir;
        }
        return '';
    }
}
exports.configPaths = new ConfigPaths();
