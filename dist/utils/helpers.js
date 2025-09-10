"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIP = validateIP;
function validateIP(ipAddress) {
    // Regular expression for IPv4
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // Regular expression for IPv6
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$/;
    // Check for IPv4
    if (ipv4Regex.test(ipAddress)) {
        const parts = ipAddress.split('.');
        for (const part of parts) {
            const num = parseInt(part, 10);
            if (isNaN(num) || num < 0 || num > 255 || (part.length > 1 && part[0] === '0')) {
                return false; // Invalid segment or leading zero
            }
        }
        return true;
    }
    // Check for IPv6
    if (ipv6Regex.test(ipAddress)) {
        // Basic regex test is often sufficient for IPv6,
        // but more rigorous checks could involve ensuring no more than one '::'
        // and proper handling of compressed forms.
        return true;
    }
    return false; // Neither IPv4 nor IPv6
}
