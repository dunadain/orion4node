export declare enum PackType {
    HANDSHAKE = 0,
    HANDSHAKE_ACK = 1,
    HEARTBEAT = 2,
    DATA = 3,
    KICK = 4,
    ERROR = 5
}
/**
 * packet protocol encode.
 *
 * Pinus packet format:
 * +------+-------------+------------------+
 * | type | body length |       body       |
 * +------+-------------+------------------+
 *
 * Head: 4bytes
 *   0: packet type,
 *      1 - handshake,
 *      2 - handshake ack,
 *      3 - heartbeat,
 *      4 - data
 *      5 - kick
 *   1 - 3: big-endian body length
 * Body: body length bytes
 *
 * @param  {PackType}    type   packet type
 * @param  {Buffer} body   body content in bytes
 * @return {Buffer}        new byte array that contains encode result
 */
export declare function encode(type: PackType, body?: Buffer): Buffer;
/**
 * packet protocol decode.
 * See encode for packet format.
 *
 * @param  {Buffer} buffer byte array containing packet content
 * @return {Object}           {type: packet type, buffer: body byte array}
 */
export declare function decode(buffer: Buffer, out?: {
    type: PackType;
    body: Buffer | undefined;
}[]): {
    type: PackType;
    body: Buffer | undefined;
}[];
