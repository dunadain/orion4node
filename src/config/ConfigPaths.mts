import * as path from 'node:path';

class ConfigPaths {
    /**
     * first find the configs directory in ./ then in ../ then in ../../
     */
    get nats() {
        const configDir = this.getConfigDir();
        return path.join(configDir, 'nats.json');
    }

    private getConfigDir() {
        // const __filename = fileURLToPath(import.meta.url);
        // const __dirname = path.dirname(__filename);
        // if (require.main) {
        //     let configDir = path.join(require.main.path, 'configs');
        //     if (!existsSync(configDir)) configDir = path.join(require.main.path, '..', 'configs');
        //     if (!existsSync(configDir)) configDir = path.join(require.main.path, '..', '..', 'configs');
        //     if (existsSync(configDir)) return configDir;
        // }
        return '';
    }
}

export const configPaths = new ConfigPaths();
