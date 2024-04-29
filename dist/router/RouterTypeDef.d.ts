/**
 * Represents the context object.
 */
export interface Context {
    /**
     * The ID of client.
     */
    id: number;
    /**
     * The ID of the protocol.
     */
    protoId: number;
    /**
     * user id
     */
    uid?: string;
    /**
     * server id
     */
    sId?: string;
}
