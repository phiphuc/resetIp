const CryptoJS = require("crypto-js");
const SHA2 = CryptoJS.algo.SHA256;
const HmacSHA2 = CryptoJS.HmacSHA256;
const cfg = {
    keySize : 8,
    hasher: SHA2,
    hmac: HmacSHA2
}

module.exports = {
    saltedPassword: function (password, salt, iterations) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: cfg.keySize,
            iterations:iterations,
            hasher: cfg.hasher
        });
    },
    
    clientProof: function  (password, salt, iterations, authMessage) {
        var spwd = this.saltedPassword(password, salt, iterations);
        var ckey = this.clientKey(spwd);
        var skey = this.storedKey(ckey);
        var csig = this.signature(skey, authMessage);
    
        for (var i = 0; i < ckey.sigBytes/4; i += 1) {
            ckey.words[i] = ckey.words[i] ^ csig.words[i]
        }
        return ckey.toString();
    },
    
    clientKey: function  (saltPwd) {
        return cfg.hmac(saltPwd, "Client Key");
    },
    
    storedKey: function (clientKey) {
        var hasher = cfg.hasher.create();
        hasher.update(clientKey);
    
        return hasher.finalize();
    },
    
    signature: function (storedKey, authMessage) {
        return cfg.hmac(storedKey, authMessage);
    },
    
    serverKey: function (saltPwd) {
        return cfg.hmac(saltPwd, "Server Key");
    }
}