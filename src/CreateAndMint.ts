// Import necessary functions and constants from the Solana web3.js and SPL Token packages
import {
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  Cluster,
  PublicKey,
} from "@solana/web3.js";

import {
  ExtensionType,
  createInitializeMintInstruction,
  mintTo,
  createAccount,
  getMintLen,
  getTransferFeeAmount,
  unpackAccount,
  TOKEN_2022_PROGRAM_ID,
  createInitializeTransferFeeConfigInstruction,
  harvestWithheldTokensToMint,
  transferCheckedWithFee,
  withdrawWithheldTokensFromAccounts,
  withdrawWithheldTokensFromMint,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccountIdempotent,
  createInitializeNonTransferableMintInstruction,
} from "@solana/spl-token";

import { connection, payer } from "./utils";

// const payer = Keypair.generate();
// const mintAuthority = Keypair.generate();
const mintAuthority = payer;
const mintKeypair = Keypair.generate();
const mint = mintKeypair.publicKey;

// Generate keys for transfer fee config authority and withdrawal authority
const transferFeeConfigAuthority = Keypair.generate();
const withdrawWithheldAuthority = Keypair.generate();

// Define the extensions to be used by the mint
const extensions = [ExtensionType.TransferFeeConfig];
// const extensions = [ExtensionType.NonTransferable];

// Calculate the length of the mint
const mintLen = getMintLen(extensions);

// Set the decimals, fee basis points, and maximum fee
const decimals = 9;
const feeBasisPoints = 100; // 1%
const maxFee = BigInt(9 * Math.pow(10, decimals)); // 9 tokens

// Define the amount to be minted and the amount to be transferred, accounting for decimals
const mintAmount = BigInt(1_000_000_000 * Math.pow(10, decimals)); // Mint 1,000,000 tokens
const transferAmount = BigInt(1_000 * Math.pow(10, decimals)); // Transfer 1,000 tokens

// Calculate the fee for the transfer
const calcFee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000); // expect 10 fee
const fee = calcFee > maxFee ? maxFee : calcFee; // expect 9 fee

// Helper function to generate Explorer URL
function generateExplorerTxUrl(txId: string) {
  return `https://explorer.solana.com/tx/${txId}?cluster=devnet`;
}

async function main() {
  // Step 1 - Airdrop to Payer
  // Disable in case of mainnet
  const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

  // Step 2 - Create a New Token
  const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeTransferFeeConfigInstruction(
      mint,
      transferFeeConfigAuthority.publicKey,
      withdrawWithheldAuthority.publicKey,
      feeBasisPoints,
      maxFee,
      TOKEN_2022_PROGRAM_ID
    ),
    // createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
    createInitializeMintInstruction(mint, decimals, mintAuthority.publicKey, null, TOKEN_2022_PROGRAM_ID)
  );
  const newTokenTx = await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);
  console.log("New Token Created:", generateExplorerTxUrl(newTokenTx));
  console.log("Mint: ", mintKeypair);

  // Step 3 - Mint tokens to Owner
  // const owner = Keypair.generate();
  const owner = payer; // currently the payer is the token owner
  const sourceAccount = await createAssociatedTokenAccountIdempotent(
    connection,
    payer,
    mint,
    owner.publicKey,
    {},
    TOKEN_2022_PROGRAM_ID
  );
  const mintSig = await mintTo(
    connection,
    payer,
    mint,
    sourceAccount,
    mintAuthority,
    mintAmount,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log("Tokens Minted:", generateExplorerTxUrl(mintSig));

  // Step 4 - Send Tokens from Owner to a New Account
  // const destinationOwner = Keypair.generate();
  // const destinationAccount = await createAssociatedTokenAccountIdempotent(
  //   connection,
  //   payer,
  //   mint,
  //   destinationOwner.publicKey,
  //   {},
  //   TOKEN_2022_PROGRAM_ID
  // );
  // const transferSig = await transferCheckedWithFee(
  //   connection,
  //   payer,
  //   sourceAccount,
  //   mint,
  //   destinationAccount,
  //   owner,
  //   transferAmount,
  //   decimals,
  //   fee,
  //   []
  // );
  // console.log("Tokens Transfered:", generateExplorerTxUrl(transferSig));

  // // Step 5 - Fetch Fee Accounts
  // const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
  //   commitment: "confirmed",
  //   filters: [
  //     {
  //       memcmp: {
  //         offset: 0,
  //         bytes: mint.toString(),
  //       },
  //     },
  //   ],
  // });

  // const accountsToWithdrawFrom: PublicKey[] = [];
  // for (const accountInfo of allAccounts) {
  //   const account = unpackAccount(accountInfo.pubkey, accountInfo.account, TOKEN_2022_PROGRAM_ID);
  //   const transferFeeAmount = getTransferFeeAmount(account);
  //   if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > BigInt(0)) {
  //     accountsToWithdrawFrom.push(accountInfo.pubkey);
  //   }
  // }

  /**
  // Step 6 - Harvest Fees
  const feeVault = Keypair.generate();
  const feeVaultAccount = await createAssociatedTokenAccountIdempotent(
    connection,
    payer,
    mint,
    feeVault.publicKey,
    {},
    TOKEN_2022_PROGRAM_ID
  );

  const withdrawSig1 = await withdrawWithheldTokensFromAccounts(
    connection,
    payer,
    mint,
    feeVaultAccount,
    withdrawWithheldAuthority,
    [],
    accountsToWithdrawFrom
  );
  console.log("Withdraw from Accounts:", generateExplorerTxUrl(withdrawSig1));
  */
}

// Execute the main function
main();
