# n8n-nodes-teckel-ipfs

An [n8n](https://n8n.io) community node for the [teckel](https://teckel.io) IPFS platform. Store, retrieve, pin and unpin encrypted files on IPFS via teckel's apigateway.

## Installation

In your self-hosted n8n instance:

1. **Settings** → **Community Nodes** → **Install**
2. Enter `n8n-nodes-teckel-ipfs`
3. Confirm and install

## Credentials

A **teckel IPFS API** credential is required:

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

## Operations

| Operation | Description |
|-----------|-------------|
| List Files | List files stored on IPFS by the authenticated agent (filters: pinned/unpinned, encrypted/unencrypted) |
| Pin Files | Pin selected files |
| Pin by CID | Pin a file by its CID |
| Publish to Web | Publish a file to the public web gateway |
| Remove by CID | Remove a file by its CID |
| Remove Files | Remove selected files |
| Retrieve File | Download a file from IPFS (returns binary) |
| Unpin Files | Unpin selected files |
| Upload Base64 | Upload a base64-encoded payload |
| Upload File | Upload a binary file from a previous node |

Upload operations support optional client-side encryption via the **Encrypt on IPFS** toggle and an optional human-readable nickname stored alongside the CID.

## Resources

- [teckel platform](https://teckel.io)
- [GitHub repo](https://github.com/teckel-io/n8n-nodes)
- [Issues](https://github.com/teckel-io/n8n-nodes/issues)

## License

[MIT](https://github.com/teckel-io/n8n-nodes/blob/main/LICENSE)
