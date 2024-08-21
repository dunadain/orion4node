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
     * server id
     */
    sId: number;
    /**
     * request id
     */
    reqId: number;
}
