const web3 = require("@solana/web3.js");
// const deployconfig = require("./deployconfig.json");

const umiBundler = require("@metaplex-foundation/umi-bundle-defaults");
const mpl = require("@metaplex-foundation/mpl-token-metadata");
const umiLib = require("@metaplex-foundation/umi");

async function createTokenAndMint(rpc, wallet, { metadata, amount, decimals }) {
  const umi = umiBundler.createUmi(rpc).use(mpl.mplTokenMetadata());

  const payer = umiLib.createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(wallet.secretKey));
  umi.use(umiLib.keypairIdentity(payer));

  const mint = umiLib.generateSigner(umi);

  await mpl
    .createAndMint(umi, {
      mint,
      authority: umi.identity,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: umiLib.percentAmount(0),
      decimals: decimals,
      amount: amount,
      tokenOwner: umi.identity.publicKey,
      tokenStandard: mpl.TokenStandard.Fungible,
    })
    .sendAndConfirm(umi)
    .then(() => {
      console.log("Token Deployed");
    });

  return { tokenAddress: mint.publicKey, mintSecretKey: mint.secretKey };
}

async function main() {
  // Example usage
  const privateKeyHex = ""; // Replace with your actual private key

  const privateKeyBytes = Buffer.from(privateKeyHex, "hex");
  const keypair = web3.Keypair.fromSecretKey(privateKeyBytes);
  const wallet = keypair;

  const rpc = web3.clusterApiUrl("devnet");

  const metadata = {
    name: "Solana Gold",
    symbol: "GOLDSOL",
    uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
  };

  createTokenAndMint(rpc, wallet, {
    metadata: metadata,
    amount: 1000000,
    decimals: 6,
  })
    .then(({ tokenAddress, mintSecretKey }) => {
      console.log("Token Address:", tokenAddress);
      console.log("Mint secret key:", mintSecretKey);
    })
    .catch((err) => {
      console.error("Error creating token:", err);
    });
}
main();
