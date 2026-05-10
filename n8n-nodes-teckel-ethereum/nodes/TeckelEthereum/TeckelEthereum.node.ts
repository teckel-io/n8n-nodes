import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';

const NETWORK_OPS = [
	'ethGasPrice', 'netPeerCount', 'ethGetUncleCountByBlockNumber', 'ethBlockNumber',
	'ethSyncing', 'ethGetCode', 'ethGetTransactionByBlockNumberAndIndex',
	'ethGetBlockTransactionCountByHash', 'ethGetTransactionByBlockHashAndIndex',
	'ethGetBalance', 'ethGetMyBalance', 'ethGetTransactionCount', 'ethGetBlockByHash',
	'ethGetUncleCountByBlockHash', 'ethGetTransactionReceipt', 'ethGetTransactionByHash',
	'ethChainId', 'ethGetBlockByNumber', 'ethGetBlockTransactionCountByNumber',
];

const BLOCK_OPS = [
	'ethGetUncleCountByBlockNumber', 'ethGetTransactionByBlockNumberAndIndex',
	'ethGetBalance', 'ethGetMyBalance', 'ethGetTransactionCount',
	'ethGetCode', 'ethGetBlockByNumber', 'ethGetBlockTransactionCountByNumber',
];

const ADDRESS_OPS = ['ethGetBalance', 'ethGetTransactionCount', 'ethGetCode'];
const HASH_OPS = ['ethGetTransactionByHash', 'ethGetTransactionReceipt', 'ethGetBlockTransactionCountByHash'];
const BLOCK_HASH_OPS = ['ethGetBlockByHash', 'ethGetUncleCountByBlockHash', 'ethGetTransactionByBlockHashAndIndex'];
const INDEX_OPS = ['ethGetTransactionByBlockHashAndIndex', 'ethGetTransactionByBlockNumberAndIndex'];
const IS_FULL_OPS = ['ethGetBlockByHash', 'ethGetBlockByNumber'];

const OP_PATHS: Record<string, string> = {
	ethGasPrice: '/eth_gasPrice',
	netPeerCount: '/net_peerCount',
	ethGetUncleCountByBlockNumber: '/eth_getUncleCountByBlockNumber',
	ethBlockNumber: '/eth_blockNumber',
	ethSyncing: '/eth_syncing',
	ethGetCode: '/eth_getCode',
	ethGetTransactionByBlockNumberAndIndex: '/eth_getTransactionByBlockNumberAndIndex',
	ethGetBlockTransactionCountByHash: '/eth_getBlockTransactionCountByHash',
	ethGetTransactionByBlockHashAndIndex: '/eth_getTransactionByBlockHashAndIndex',
	ethGetBalance: '/eth_getBalance',
	ethGetMyBalance: '/eth_getMyBalance',
	ethGetTransactionCount: '/eth_getTransactionCount',
	ethGetBlockByHash: '/eth_getBlockByHash',
	ethGetUncleCountByBlockHash: '/eth_getUncleCountByBlockHash',
	ethGetTransactionReceipt: '/eth_getTransactionReceipt',
	ethGetTransactionByHash: '/eth_getTransactionByHash',
	ethChainId: '/eth_chainId',
	ethGetBlockByNumber: '/eth_getBlockByNumber',
	ethGetBlockTransactionCountByNumber: '/eth_getBlockTransactionCountByNumber',
	ethereumHelp: '/get_api_ethereum_help',
};

const BLOCK_PARAM_DESC = "Block number (integer) or one of: latest, earliest, pending, safe, finalized";

export class TeckelEthereum implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'teckel Ethereum',
		name: 'teckelEthereum',
		icon: 'file:teckel-ethereum.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Query the Ethereum blockchain via the teckel platform',
		defaults: { name: 'teckel Ethereum' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'teckelEthereumApi', required: true }],
		properties: [

			// ── Operation selector ───────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'ethBlockNumber',
				options: [
					{ name: 'Block Number', value: 'ethBlockNumber', description: 'Get the most recent block number', action: 'Block number' },
					{ name: 'Chain ID', value: 'ethChainId', description: 'Get the chain ID for replay-protected transactions', action: 'Chain ID' },
					{ name: 'Gas Price', value: 'ethGasPrice', description: 'Get the current gas price in Wei', action: 'Gas price' },
					{ name: 'Get Balance', value: 'ethGetBalance', description: 'Get the balance of an address', action: 'Get balance' },
					{ name: 'Get Block by Hash', value: 'ethGetBlockByHash', description: 'Get block information by block hash', action: 'Get block by hash' },
					{ name: 'Get Block by Number', value: 'ethGetBlockByNumber', description: 'Get block information by block number', action: 'Get block by number' },
					{ name: 'Get Block Tx Count by Hash', value: 'ethGetBlockTransactionCountByHash', description: 'Get transaction count for a block by block hash', action: 'Get block tx count by hash' },
					{ name: 'Get Block Tx Count by Number', value: 'ethGetBlockTransactionCountByNumber', description: 'Get transaction count for a block by block number', action: 'Get block tx count by number' },
					{ name: 'Get Code', value: 'ethGetCode', description: 'Get the bytecode at an address (non-empty = contract)', action: 'Get code' },
					{ name: 'Get My Balance', value: 'ethGetMyBalance', description: 'Get the balance for the account linked to the API key', action: 'Get my balance' },
					{ name: 'Get Transaction by Block Hash and Index', value: 'ethGetTransactionByBlockHashAndIndex', description: 'Get a transaction by block hash and index', action: 'Get transaction by block hash and index' },
					{ name: 'Get Transaction by Block Number and Index', value: 'ethGetTransactionByBlockNumberAndIndex', description: 'Get a transaction by block number and index', action: 'Get transaction by block number and index' },
					{ name: 'Get Transaction by Hash', value: 'ethGetTransactionByHash', description: 'Get transaction details by transaction hash', action: 'Get transaction by hash' },
					{ name: 'Get Transaction Count', value: 'ethGetTransactionCount', description: 'Get the number of transactions sent from an address', action: 'Get transaction count' },
					{ name: 'Get Transaction Receipt', value: 'ethGetTransactionReceipt', description: 'Get the receipt of a transaction by hash', action: 'Get transaction receipt' },
					{ name: 'Get Uncle Count by Block Hash', value: 'ethGetUncleCountByBlockHash', description: 'Get uncle count for a block by block hash', action: 'Get uncle count by block hash' },
					{ name: 'Get Uncle Count by Block Number', value: 'ethGetUncleCountByBlockNumber', description: 'Get uncle count for a block by block number', action: 'Get uncle count by block number' },
					{ name: 'Help', value: 'ethereumHelp', description: 'Get help on the teckel Ethereum toolbox', action: 'Help' },
					{ name: 'Peer Count', value: 'netPeerCount', description: 'Get the peer count on the execution client node', action: 'Peer count' },
					{ name: 'Syncing', value: 'ethSyncing', description: 'Get sync status of the execution client node', action: 'Syncing' },
				],
			},

			// ── Network ──────────────────────────────────────────────────────
			{
				displayName: 'Network',
				name: 'network',
				type: 'options',
				default: 'mainnet',
				options: [
					{ name: 'Mainnet', value: 'mainnet' },
					{ name: 'Sepolia', value: 'sepolia' },
				],
				displayOptions: { show: { operation: NETWORK_OPS } },
			},

			// ── Block ────────────────────────────────────────────────────────
			{
				displayName: 'Block',
				name: 'block',
				type: 'string',
				default: 'latest',
				description: BLOCK_PARAM_DESC,
				displayOptions: { show: { operation: BLOCK_OPS } },
			},

			// ── Address ──────────────────────────────────────────────────────
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				required: true,
				description: 'Ethereum address (0x-prefixed hex)',
				displayOptions: { show: { operation: ADDRESS_OPS } },
			},

			// ── Transaction Hash ─────────────────────────────────────────────
			{
				displayName: 'Transaction Hash',
				name: 'hash',
				type: 'string',
				default: '',
				required: true,
				description: 'Transaction hash (0x-prefixed hex)',
				displayOptions: { show: { operation: HASH_OPS } },
			},

			// ── Block Hash ───────────────────────────────────────────────────
			{
				displayName: 'Block Hash',
				name: 'block_hash',
				type: 'string',
				default: '',
				required: true,
				description: 'Block hash (0x-prefixed hex)',
				displayOptions: { show: { operation: BLOCK_HASH_OPS } },
			},

			// ── Index ────────────────────────────────────────────────────────
			{
				displayName: 'Transaction Index',
				name: 'index',
				type: 'string',
				default: '0',
				required: true,
				description: 'Transaction index position (integer)',
				displayOptions: { show: { operation: INDEX_OPS } },
			},

			// ── Is Full ──────────────────────────────────────────────────────
			{
				displayName: 'Full Block',
				name: 'is_full',
				type: 'boolean',
				default: false,
				description: 'Whether to return full transaction objects (true) or only transaction hashes (false)',
				displayOptions: { show: { operation: IS_FULL_OPS } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('teckelEthereumApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
		const apiKey = credentials.apiKey as string;
		const authHeader = { Authorization: `Bearer ${apiKey}` };

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const path = OP_PATHS[operation];
				const qs: IDataObject = {};

				if (NETWORK_OPS.includes(operation)) {
					qs.network = this.getNodeParameter('network', i, 'mainnet') as string;
				}
				if (BLOCK_OPS.includes(operation)) {
					qs.block = this.getNodeParameter('block', i, 'latest') as string;
				}
				if (ADDRESS_OPS.includes(operation)) {
					qs.address = this.getNodeParameter('address', i) as string;
				}
				if (HASH_OPS.includes(operation)) {
					qs.hash = this.getNodeParameter('hash', i) as string;
				}
				if (BLOCK_HASH_OPS.includes(operation)) {
					qs.block_hash = this.getNodeParameter('block_hash', i) as string;
				}
				if (INDEX_OPS.includes(operation)) {
					qs.index = this.getNodeParameter('index', i) as string;
				}
				if (IS_FULL_OPS.includes(operation)) {
					qs.is_full = (this.getNodeParameter('is_full', i, false) as boolean) ? 'true' : 'false';
				}

				const responseData = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}${path}`,
					headers: authHeader,
					qs,
				}) as IDataObject;

				returnData.push({ json: responseData, pairedItem: i });

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
