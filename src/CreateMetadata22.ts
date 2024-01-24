import {
  createV1,
  updateV1,
  Collection,
  Creator,
  Uses,
  CreateV1InstructionAccounts,
  CreateV1InstructionData,
  TokenStandard,
  CollectionDetails,
  PrintSupply,
  UpdateV1InstructionAccounts,
  Data,
} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import {
  PublicKey,
  createSignerFromKeypair,
  none,
  percentAmount,
  publicKey,
  signerIdentity,
  some,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import * as bs58 from "bs58";
import dotenv from "dotenv";
dotenv.config();

const SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

export function loadWalletKey(keypairFile: string): web3.Keypair {
  const fs = require("fs");
  const loaded = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())));
  return loaded;
}

const INITIALIZE = true;

async function main() {
  // Load wallet key pair from local json file
  // const myKeypair = loadWalletKey("<key>.json"); // Replace with your own json file

  // Load wallet key pair from private key hex of env
  const privateKeyBytes = Buffer.from(process.env.PRIVATE_KEY, "hex");
  const keypair = web3.Keypair.fromSecretKey(privateKeyBytes);

  const mint = new web3.PublicKey(process.env.SPL_TOKEN_2022_MINT);

  const umi = createUmi("https://api.devnet.solana.com");
  const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(keypair));
  umi.use(signerIdentity(signer, true));

  const ourMetadata = {
    name: "Solana Gold",
    symbol: "GOLDSOL",
    uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
  };

  if (INITIALIZE) {
    const onChainData = {
      ...ourMetadata,
      // we don't need that
      sellerFeeBasisPoints: percentAmount(0, 2),
      creators: none<Creator[]>(),
      collection: none<Collection>(),
      uses: none<Uses>(),
    };
    const accounts: CreateV1InstructionAccounts = {
      mint: fromWeb3JsPublicKey(mint),
      splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
    };
    const data: CreateV1InstructionData = {
      ...onChainData,
      isMutable: true,
      discriminator: 0,
      tokenStandard: TokenStandard.Fungible,
      collectionDetails: none<CollectionDetails>(),
      ruleSet: none<PublicKey>(),
      createV1Discriminator: 0,
      primarySaleHappened: true,
      decimals: none<number>(),
      printSupply: none<PrintSupply>(),
    };
    const txid = await createV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);
    console.log(bs58.encode(txid.signature));
  } else {
    const onChainData = {
      ...ourMetadata,
      sellerFeeBasisPoints: 6000,
      creators: none<Creator[]>(),
      collection: none<Collection>(),
      uses: none<Uses>(),
    };
    const accounts: UpdateV1InstructionAccounts = {
      mint: fromWeb3JsPublicKey(mint),
    };
    const data = {
      discriminator: 0,
      data: some<Data>(onChainData),
      updateV1Discriminator: 0,
    };
    const txid = await updateV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);
    console.log(bs58.encode(txid.signature));
  }
}

main();
