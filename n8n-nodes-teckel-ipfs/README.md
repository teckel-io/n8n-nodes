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
