// Import necessary functions and constants from the Solana web3.js and SPL Token packages
import * as web3 from "@solana/web3.js";
import * as bs58 from "bs58";

export const RPC_URL =
  process.env.PRODUCTION === "true"
    ? "https://solana-mainnet.g.alchemy.com/v2/sC8DxeKgZ-IdwUDTMna1CELbb71BuNK4"
    : "https://api.devnet.solana.com";

// Initialize connection to local Solana node
export const connection = new web3.Connection(RPC_URL, "confirmed");

// Generate keys for payer, mint authority, and mint
// const privateKeyBytes = Buffer.from(process.env.PRIVATE_KEY, "hex");
const privateKeyBytes = Uint8Array.from(bs58.decode(process.env.PRIVATE_KEY));
export const payer = web3.Keypair.fromSecretKey(privateKeyBytes);

export const mint = new web3.PublicKey(
  process.env.TOKEN_TYPE === "spl22" ? process.env.SPL_TOKEN_2022_MINT : process.env.SPL_TOKEN_MINT
);
