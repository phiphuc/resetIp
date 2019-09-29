var CryptoJS = require("crypto-js");
const scram = require('./lib/scram');

var  response = {
    sails: '71514b54686838525977554552306975536c5647626157374c6469354e493800',
    servernonce:'4f38f0a8e83e9a71728b8bab8f00662bdd0b8e41cb440132412680ae23f6bf53vJK7cjrNt9zhkbyIFD9J4vEGsvLs9unC',
    firstNonce:'4f38f0a8e83e9a71728b8bab8f00662bdd0b8e41cb440132412680ae23f6bf53'
};

var psd = "admin123";

var salt = CryptoJS.enc.Hex.parse(response.sails);
var iter = "100";
var finalNonce=  response.servernonce;
var authMsg = response.firstNonce + "," + finalNonce + "," + finalNonce;
var saltPassword = scram.saltedPassword(psd,salt,iter).toString();
// saltPassword : "4f38f0a8e83e9a71728b8bab8f00662bdd0b8e41cb440132412680ae23f6bf53,4f38f0a8e83e9a71728b8bab8f00662bdd0b8e41cb440132412680ae23f6bf53vJK7cjrNt9zhkbyIFD9J4vEGsvLs9unC,4f38f0a8e83e9a71728b8bab8f00662bdd0b8e41cb440132412680ae23f6bf53vJK7cjrNt9zhkbyIFD9J4vEGsvLs9unC"
var clientProof = scram.clientProof(psd, salt, iter, authMsg);
var serverKey = serverKey(CryptoJS.enc.Hex.parse(saltPassword)).toString();

console.log('clientProof: '+clientProof)
console.log('finalNonce: '+finalNonce)