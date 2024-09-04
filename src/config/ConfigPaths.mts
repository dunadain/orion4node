import * as path from 'node:path';
import { existsSync } from 'node:fs';

class ConfigPaths {
    /**
     * first find the configs directory in ./ then in ../ then in ../../
     */
    get nats() {
        const configDir = this.getConfigDir();
        return path.join(configDir, 'nats.json');
    }

    private getConfigDir() {
        if (require.main) {
            let configDir = path.join(require.main.path, 'configs');
            if (!existsSync(configDir)) configDir = path.join(require.main.path, '..', 'configs');
            if (!existsSync(configDir)) configDir = path.join(require.main.path, '..', '..', 'configs');
            if (existsSync(configDir)) return configDir;
        }
        return '';
    }
}

export const configPaths = new ConfigPaths();
