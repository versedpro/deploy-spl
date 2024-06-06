import * as web3 from "@solana/web3.js";
import * as umiBundler from "@metaplex-foundation/umi-bundle-defaults";
import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as umiLib from "@metaplex-foundation/umi";
import { TOKEN_PROGRAM_ID, setAuthority } from "@solana/spl-token";
import { payer, connection, mint } from "./utils";

const wallet = payer;

const rpc = web3.clusterApiUrl(process.env.PRODUCTION === "true" ? "mainnet-beta" : "devnet");

const metadata = {
  name: "Solana Gold",
  symbol: "GOLDSOL",
  uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
};

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
      amount: BigInt(amount * Math.pow(10, decimals)),
      tokenOwner: umi.identity.publicKey,
      tokenStandard: mpl.TokenStandard.Fungible,
    })
    .sendAndConfirm(umi)
    .then(() => {
      console.log("Token Deployed");
    });

  return { tokenAddress: mint.publicKey, mintSecretKey: mint.secretKey };
}

async function createAndMintSpl() {
  createTokenAndMint(rpc, wallet, {
    metadata: metadata,
    amount: 1000000000,
    decimals: 9,
  })
    .then(({ tokenAddress, mintSecretKey }) => {
      console.log("Token Address:", tokenAddress);
      console.log("Mint secret key:", mintSecretKey);
    })
    .catch((err) => {
      console.error("Error creating token:", err);
    });
}

export async function revokeFreezeAuthority() {
  // Revoke the freeze authority
  const signature = await setAuthority(
    connection,
    payer,
    mint,
    payer.publicKey,
    1,
    null,
    [],
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log(signature);
}

export default createAndMintSpl;
