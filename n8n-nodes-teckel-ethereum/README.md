# n8n-nodes-teckel-ethereum

An [n8n](https://n8n.io) community node for the [teckel](https://teckel.io) Ethereum toolbox. Read-only JSON-RPC access to Ethereum mainnet and Sepolia testnet via teckel's apigateway.

## Installation

In your self-hosted n8n instance:

1. **Settings** → **Community Nodes** → **Install**
2. Enter `n8n-nodes-teckel-ethereum`
3. Confirm and install

## Credentials

A **teckel Ethereum API** credential is required:

| Field | Description |
|-------|-------------|
| API Key | Your teckel API key |
| Base URL | teckel API gateway URL (default: `https://mcp-servers.bh.tkllabs.io:9780`) |

### How to obtain your teckel API Key

#### First, download and install the teckel App.

[<img width="120" height="40" alt="Download on the App Store" src="https://github.com/user-attachments/assets/ecbe6c7a-02c9-4212-b2ab-58dd90c91bca" />](https://apps.apple.com/gb/app/teckel/id6746805799)
[<img width="135" height="45" alt="Get it on Google Play" src="https://github.com/user-attachments/assets/9f9b8443-d759-41c1-9fce-399dc690b439" />](https://play.google.com/store/apps/details?id=io.teckel.app)

#### Next, generate an API key using the teckel App.

1. Navigate to the Accounts page by tapping on the wallet icon in the upper right corner of the App home screen. Access the API Key Manager for the created or imported Ethereum Account by tapping **Manage API Key** on the Accounts page.
2. Enter the API key in the n8n credentials edit box.

## Operations (20)

All operations accept a **Network** parameter (`mainnet` or `sepolia`).

### Chain & gas

| Operation | Description |
|-----------|-------------|
| Block Number | Most recent block number |
| Chain ID | Chain ID for replay-protected transactions |
| Gas Price | Current gas price in Wei |
| Peer Count | Peer count on the execution client |
| Syncing | Sync status of the execution client |

### Account & balance

| Operation | Description |
|-----------|-------------|
| Get Balance | Balance of any address |
| Get My Balance | Balance for the account linked to the API key |
| Get Code | Bytecode at an address (non-empty = contract) |
| Get Transaction Count | Number of transactions sent from an address |

### Block queries

| Operation | Description |
|-----------|-------------|
| Get Block by Hash | Block info by block hash |
| Get Block by Number | Block info by block number |
| Get Block Tx Count by Hash | Transaction count for a block (by hash) |
| Get Block Tx Count by Number | Transaction count for a block (by number) |
| Get Uncle Count by Block Hash | Uncle count by block hash |
| Get Uncle Count by Block Number | Uncle count by block number |

### Transaction queries

| Operation | Description |
|-----------|-------------|
| Get Transaction by Hash | Transaction details by hash |
| Get Transaction by Block Hash and Index | Transaction by block hash + index |
| Get Transaction by Block Number and Index | Transaction by block number + index |
| Get Transaction Receipt | Transaction receipt by hash |

### Help

| Operation | Description |
|-----------|-------------|
| Help | Get help on the teckel Ethereum toolbox |

## Resources

- [teckel platform](https://teckel.io)
- [GitHub repo](https://github.com/teckel-io/n8n-nodes)
- [Issues](https://github.com/teckel-io/n8n-nodes/issues)

## License

[MIT](https://github.com/teckel-io/n8n-nodes/blob/main/LICENSE)
