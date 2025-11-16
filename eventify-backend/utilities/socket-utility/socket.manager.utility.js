/**
 * @module utils/socketStore
 * @description Stores active user socket connections mapping
 */

/**
 * @constant activeUsers
 * @description Map storing userId to socketId mapping for active connections
 * @type {Map<string, string>}
 */
const activeUsers = new Map();

module.exports = { activeUsers };
