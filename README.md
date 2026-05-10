# teckel n8n community nodes

A monorepo of [n8n](https://n8n.io) community nodes for the [teckel](https://teckel.io) platform.

## Packages

| Package | Description | Operations |
|---------|-------------|-----------:|
| [`n8n-nodes-teckel-ipfs`](./n8n-nodes-teckel-ipfs) | Store, retrieve, pin and unpin encrypted files on IPFS | 10 |
| [`n8n-nodes-teckel-ethereum`](./n8n-nodes-teckel-ethereum) | Read-only JSON-RPC access to Ethereum mainnet & Sepolia | 20 |
| [`n8n-nodes-teckel-navigation`](./n8n-nodes-teckel-navigation) | Aviation weather, flight routing, geocoding, airport search | 31 |

## Installation

Self-hosted n8n only — community nodes are not supported on n8n Cloud.

For each package:

1. In your n8n instance: **Settings** → **Community Nodes** → **Install**
2. Enter the package name (e.g. `n8n-nodes-teckel-ipfs`)
3. Confirm and install

## Credentials

Each package defines its own credential type, but all share the same two fields:

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

## Repo layout

```
n8n-nodes/
├── README.md                         (this file)
├── LICENSE
├── n8n-nodes-teckel-ipfs/
├── n8n-nodes-teckel-ethereum/
└── n8n-nodes-teckel-navigation/
```

Each package directory contains its own `README.md`, `package.json`, TypeScript source under `nodes/` and `credentials/`, an SVG icon, and a `deploy.ps1` / `publish.ps1` for internal use.

## Building

Each package builds via Docker:

```bash
docker run --rm -v "$(pwd):/pkg" node:18-alpine sh -c "cd /pkg && rm -rf dist && npm install --ignore-scripts && npm run build"
```

## License

[MIT](./LICENSE)
