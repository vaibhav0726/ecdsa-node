// this library is used to sign the transaction
const secp = require("ethereum-cryptography/secp256k1");
// used for hashing
const { toHex } = require("ethereum-cryptography/utils");

// returns a private random key
const privateKey = secp.utils.randomPrivateKey(); // coming as a byte array

// now toHex will convert the private key(byte array) into hexadecimal format
console.log("privateKey:- ", toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);
console.log("publicKey: ", toHex(publicKey));
