/**
 * Represents the context object.
 */
export interface Context {
    /**
     * The ID of client.
     */
    clientId: number;
    /**
     * The ID of the protocol.
     */
    protoId: number;
    /**
     * user id
     */
    uid: string;
    /**
     * role id
     */
    roleid: string;
    /**
     * server uuid
     */
    sUuid: string;
    /**
     * request id
     */
    reqId: number;
}
