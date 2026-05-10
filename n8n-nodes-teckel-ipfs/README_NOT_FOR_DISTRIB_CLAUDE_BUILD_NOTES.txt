In principle, would you be able to build an n8n community node that encapsulates our ipfs api calls (those with tag ["ipfs"] in main.py ?

Done. Here's what was built:


n8n-nodes-teckel-ipfs/
├── package.json
├── tsconfig.json
├── index.js
├── .npmignore
├── scripts/
│   └── copy-assets.js          ← copies SVG into dist/ after tsc
├── credentials/
│   └── TeckelIpfsApi.credentials.ts
└── nodes/TeckelIpfs/
    ├── TeckelIpfs.node.ts       ← all 10 operations
    └── teckel-ipfs.svg
10 operations covered: List Files, Remove Files, Pin Files, Unpin Files, Pin by CID, Remove by CID, Publish to Web, Upload File (multipart binary), Upload Base64, Retrieve File (binary output).

To build and install (requires Node 18+, e.g. in Docker):


npm install
npm run build
# Then symlink into n8n's custom nodes dir or publish to npm
To install locally in n8n CE:


.\deploy.ps1 -NoPutty -KeyFile "$env:USERPROFILE\.ssh\deploy_key"



OLD NOTES:


# In n8n's data directory:
npm install /path/to/n8n-nodes-teckel-ipfs

How do I do this if n8n CE running on docker  # In n8n's data directory:
npm install /path/to/n8n-nodes-teckel-ipfs
Two practical options depending on whether you want a quick dev test or a proper production deployment.

Option A — Quick dev test (exec into running container)


# 1. Build the package locally (needs Node 18+ — use a Docker container if needed)

docker run --rm -v "g:/iqyu_python_pg/python/n8n-nodes-teckel-ipfs:/pkg" node:18-alpine sh -c "cd /pkg && npm install --ignore-scripts && npm run build"




# 2. Copy the built package into the running n8n container
docker cp "g:/iqyu_python_pg/python/n8n-nodes-teckel-ipfs" <n8n_container_name>:/home/node/.n8n/custom/

# 3. Install it from inside the container
docker exec -u node <n8n_container_name> sh -c "cd /home/node/.n8n && npm install /home/node/.n8n/custom/n8n-nodes-teckel-ipfs"

# 4. Restart the container
docker restart <n8n_container_name>
Option B — Production (custom Dockerfile, recommended for Swarm)

Create Dockerfile alongside your existing n8n Swarm config:


FROM n8nio/n8n:2.15.1

USER root

# Copy the pre-built package
COPY n8n-nodes-teckel-ipfs /tmp/n8n-nodes-teckel-ipfs

# Build TypeScript (if not pre-built)
RUN cd /tmp/n8n-nodes-teckel-ipfs && npm install && npm run build

# Install into n8n's data directory so it persists
RUN mkdir -p /home/node/.n8n && \
    cd /home/node/.n8n && \
    npm install /tmp/n8n-nodes-teckel-ipfs && \
    chown -R node:node /home/node/.n8n

USER node
Then update your Swarm compose to use this image instead of n8nio/n8n:


services:
  n8n:
    image: your-registry/n8n-teckel:2.15.1   # your custom image
    environment:
      - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
Build and push:


docker build -t your-registry/n8n-teckel:2.15.1 .
docker push your-registry/n8n-teckel:2.15.1
docker service update --image your-registry/n8n-teckel:2.15.1 <service_name>
Key point: The Node 18+ requirement is only for the build step — the node:18-alpine one-liner in Option A avoids needing to upgrade your host Node.js. The compiled dist/ output runs fine on n8n's bundled Node.


COMPLETE BUILD AND DEPLOY LOCALLY ON n8n1 RUN ONE AT A TIME

cd "G:\iqyu_python_pg\python\n8n-nodes-teckel-ipfs"
.\deploy.ps1 -NoPutty -KeyFile "$env:USERPROFILE\.ssh\deploy_key"

cd "G:\iqyu_python_pg\python\n8n-nodes-teckel-ethereum"
.\deploy.ps1 -NoPutty -KeyFile "$env:USERPROFILE\.ssh\deploy_key"

cd "G:\iqyu_python_pg\python\n8n-nodes-teckel-navigation"
.\deploy.ps1 -NoPutty -KeyFile "$env:USERPROFILE\.ssh\deploy_key"

OR THIS FOR ALL AT ONCE

cd "G:\iqyu_python_pg\python"
.\deploy-all-n8n-nodes.ps1 -NoPutty -KeyFile "$env:USERPROFILE\.ssh\deploy_key"


DEPLOY IN PROD on npm

PS G:\iqyu_python_pg\python> .\publish-all-n8n-nodes.ps1 -DryRun
==> publish-all-n8n-nodes starting (BumpType=patch DryRun=True)


When you're ready to publish for real, run:

.\publish-all-n8n-nodes.ps1 -BumpType none

That publishes at the current 1.0.1 without bumping again. For future releases use -BumpType patch (default) or minor/major as appropriate.

Will this make them automatically available to n8n or is there a further step to "resgister" the deployed npm packages with n8n?
Publishing to npm is sufficient — no registration required. Once published, any self-hosted n8n user can install via:

Settings → Community Nodes → Install → type the package name (e.g. n8n-nodes-teckel-ipfs)

n8n fetches directly from npm. The "n8n-community-node-package" keyword in each package.json is what makes n8n recognise it as a community node in that UI.

Two caveats worth knowing:

n8n Cloud: community nodes are blocked on n8n Cloud entirely — only works on self-hosted instances.

n8n's verified node list: n8n maintains an optional verified/featured list at docs.n8n.io. Being on it increases visibility but is not required for installation. If you want to pursue that later, it involves submitting to their community forum and going through their review process.

For your own n8n1 server specifically — once published to npm, you'd also have the option to install via the normal community nodes UI rather than the deploy.ps1 script, though the deploy script will always be faster for your own updates since it skips npm entirely.

