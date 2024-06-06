import dotenv from "dotenv";
dotenv.config();
import createAndMintSpl, { revokeFreezeAuthority } from "./spl";

// Create and Mint a SPL with freeze enabled.
// It will set metadata automatically by metaplex library.
// createAndMintSpl();

// revoke freeze authority
revokeFreezeAuthority();
