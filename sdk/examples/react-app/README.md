# React Example

Demonstrates using the BWICK Chain SDK in a React application with wallet
connection and balance display.

## Setup

1. Start local BWICK Chain:
   ```bash
   bwick localnet start
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

## What it demonstrates

- Creating a read-only client (`createClient`)
- Displaying chain info (chain ID, block height)
- Connecting a wallet with the modal (`showWalletModal`)
- Querying and displaying account balance (`getBalance`, `formatBWICK`)
- Disconnecting wallet

## Requirements

For wallet connection to work:
- Install Keplr or Leap browser extension
- BWICK Chain must be added to the wallet (the SDK will prompt to add it)
