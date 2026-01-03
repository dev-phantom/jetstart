"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const client_1 = require("@sanity/client");
exports.client = (0, client_1.createClient)({
    projectId: 's89mi5lk', // Public ID
    dataset: 'production',
    useCdn: true, // Use CDN for client-side fetching
    apiVersion: '2023-05-03',
});
//# sourceMappingURL=sanityClient.js.map