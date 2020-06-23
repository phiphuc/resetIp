const CryptoJS = require("crypto-js");
const scram = require('./scram');
const constants = require('../Utils/utils');

module.exports = {
    encrypData: (data) => {
        const salt = CryptoJS.enc.Hex.parse(data.salt);
        var iter = "100";
        var finalNonce = data.servernonce;
        var authMsg = data.firstNonce + "," + finalNonce + "," + finalNonce;
        var clientProof = scram.clientProof(constants.PWS, salt, iter, authMsg);
        return {clientProof,finalNonce}
    },

    genFirstNonce: () => {
            return CryptoJS.lib.WordArray.random(8 * 4);
    }
}