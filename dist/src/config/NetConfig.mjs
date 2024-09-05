class NetConfig {
    heartbeatInterval = 20000; // miliseconds
    heartbeatTimeout = this.heartbeatInterval * 2; // miliseconds
}
export const netConfig = new NetConfig();
