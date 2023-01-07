const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const { wallets, hashMessage, getAddress } = require("./scripts/wallets");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

const balances = {
  [wallets[0].address]: 100,
  [wallets[1].address]: 50,
  [wallets[2].address]: 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // const { signedTransaction, recipient, amount } = req.body;
  try {
    const { recipient, amount, signedTransaction } = req.body;

    const [signObject, recoveryBit] = signedTransaction;
    const signature = Uint8Array.from(Object.values(signObject));

    const messageHash = hashMessage(recipient + amount);

    // getting sender's public key
    const senderPublicKey = secp.recoverPublicKey(
      messageHash,
      signature,
      recoveryBit
    );

    // validating the transaction
    const isValidTransaction = secp.verify(
      signature,
      messageHash,
      senderPublicKey
    );

    const sender = getAddress(senderPublicKey);

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (!isValidTransaction) {
      return res.status(400).send({ message: "Invalid transaction!" });
    }

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (err) {
    console.log("error in the backend", err);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

module.exports = balances;
