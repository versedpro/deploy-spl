# Create and Mint process

## Create a SPL token-2022

1. Create a spl token-2022 using `src/CreateAndMint.ts`

   - simply run this command

   ```sh
   yarn start
   ```

   - This file creates a token and mint to the owner. You can customize the script with your own.

2. Get mint account from output.

   - Please get mint account address from associated tx of output. Don't skip output check.

   - Save whatever you need.

   - Go `.env` file and edit _SPL_TOKEN_2022_MINT_ value with your mint address.

3. Mint custom amount using `src/CreateAndMint.ts` file. You need to customize the values of this file or are able to separate mint process.

## Create a metadata for mint

If you check the mint address, you can see unrecognized token detail on explorer. We need to create a metadata and set it now. We use **metaplex**

1. Create a metadata with metaplex token standard using `src/CreateMetadata22.ts`

   - run this command

   ```sh
   yarn metadata
   ```

   - This script sets metadata of mint for you.

   - _You can customize metadata from this script._

2. Done

Happy deploying!
