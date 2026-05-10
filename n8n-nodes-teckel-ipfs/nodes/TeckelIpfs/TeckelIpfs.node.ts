import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';

// Shared filter params displayed on list/remove/pin/unpin operations
const FILTER_PARAM_OPS = ['listFiles', 'removeFiles', 'pinFiles', 'unpinFiles'];

// Map from operation value -> endpoint path
const FILTER_OP_PATHS: Record<string, string> = {
	listFiles: '/get_ipfs_content_for_apikey',
	removeFiles: '/remove_ipfs_files_from_account',
	pinFiles: '/pin_ipfs_files_for_apikey',
	unpinFiles: '/unpin_ipfs_files_for_apikey',
};

export class TeckelIpfs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'teckel IPFS',
		name: 'teckelIpfs',
		icon: 'file:teckel-ipfs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Store, retrieve and manage files on IPFS via the teckel platform',
		defaults: { name: 'teckel IPFS' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'teckelIpfsApi', required: true }],
		properties: [

			// ── Operation selector ─────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listFiles',
				options: [
					{
						name: 'List Files',
						value: 'listFiles',
						description: 'List IPFS files for the account, with optional filters',
						action: 'List files',
					},
					{
						name: 'Pin Files',
						value: 'pinFiles',
						description: 'Pin IPFS files matching filters',
						action: 'Pin files',
					},
					{
						name: 'Pin by CID',
						value: 'pinByCid',
						description: 'Pin a single file by its CID',
						action: 'Pin by CID',
					},
					{
						name: 'Publish to Web',
						value: 'publishToWeb',
						description: 'Publish an IPFS file to the teckel web server and return a public URL',
						action: 'Publish to web',
					},
					{
						name: 'Remove by CID',
						value: 'removeByCid',
						description: 'Unpin and remove a single file by its CID',
						action: 'Remove by CID',
					},
					{
						name: 'Remove Files',
						value: 'removeFiles',
						description: 'Unpin and remove IPFS files matching filters',
						action: 'Remove files',
					},
					{
						name: 'Retrieve File',
						value: 'retrieveFile',
						description: 'Retrieve a file from IPFS as binary data',
						action: 'Retrieve file',
					},
					{
						name: 'Unpin Files',
						value: 'unpinFiles',
						description: 'Unpin IPFS files matching filters',
						action: 'Unpin files',
					},
					{
						name: 'Upload Base64',
						value: 'uploadBase64',
						description: 'Upload a base64-encoded file to IPFS',
						action: 'Upload base64',
					},
					{
						name: 'Upload File',
						value: 'uploadFile',
						description: 'Upload a binary file to IPFS',
						action: 'Upload file',
					},
				],
			},

			// ── Shared filter params (list / remove / pin / unpin) ─────────────
			{
				displayName: 'Search String',
				name: 'search_string',
				type: 'string',
				default: '',
				description: 'Filter by nickname (fuzzy match). Leave blank to match all.',
				displayOptions: { show: { operation: FILTER_PARAM_OPS } },
			},
			{
				displayName: 'Pinned State',
				name: 'pinned_state',
				type: 'options',
				default: 0,
				options: [
					{ name: 'All', value: 0 },
					{ name: 'Pinned Only', value: 1 },
					{ name: 'Unpinned Only', value: 2 },
				],
				displayOptions: { show: { operation: FILTER_PARAM_OPS } },
			},
			{
				displayName: 'Encrypted State',
				name: 'encrypted_state',
				type: 'options',
				default: 0,
				options: [
					{ name: 'All', value: 0 },
					{ name: 'Encrypted Only', value: 1 },
					{ name: 'Unencrypted Only', value: 2 },
				],
				displayOptions: { show: { operation: FILTER_PARAM_OPS } },
			},
			{
				displayName: 'Content Type',
				name: 'content_type',
				type: 'string',
				default: '',
				description: 'Filter by content type e.g. image, audio, video. Leave blank to ignore.',
				displayOptions: { show: { operation: FILTER_PARAM_OPS } },
			},

			// ── CID (pin / remove / publish / retrieve) ────────────────────────
			{
				displayName: 'CID',
				name: 'cid',
				type: 'string',
				default: '',
				required: true,
				description: 'IPFS content identifier',
				displayOptions: {
					show: { operation: ['pinByCid', 'removeByCid', 'publishToWeb', 'retrieveFile'] },
				},
			},

			// ── Upload File ────────────────────────────────────────────────────
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: 'Name of the binary input field containing the file to upload',
				displayOptions: { show: { operation: ['uploadFile'] } },
			},

			// ── Upload Base64 ──────────────────────────────────────────────────
			{
				displayName: 'Base64 Data',
				name: 'base64_data',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				description: 'Base64-encoded file data',
				displayOptions: { show: { operation: ['uploadBase64'] } },
			},

			// ── Shared upload options ──────────────────────────────────────────
			{
				displayName: 'Nickname on IPFS',
				name: 'nicknameOnIPFS',
				type: 'string',
				default: '',
				description: 'Label for the file in the IPFS inventory. Auto-generated if blank.',
				displayOptions: { show: { operation: ['uploadFile', 'uploadBase64'] } },
			},
			{
				displayName: 'Encrypt on IPFS',
				name: 'doEncryptOnIPFS',
				type: 'boolean',
				default: false,
				description: 'Whether to encrypt the file before uploading to IPFS',
				displayOptions: { show: { operation: ['uploadFile', 'uploadBase64'] } },
			},

			// ── Retrieve File output field ─────────────────────────────────────
			{
				displayName: 'Output Binary Field',
				name: 'outputBinaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary output field the retrieved file will be written to',
				displayOptions: { show: { operation: ['retrieveFile'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('teckelIpfsApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
		const apiKey = credentials.apiKey as string;
		const authHeader = { Authorization: `Bearer ${apiKey}` };

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				// ── Filter-based operations ──────────────────────────────────
				if (FILTER_OP_PATHS[operation]) {
					const qs: IDataObject = {
						search_string: this.getNodeParameter('search_string', i, '') as string,
						pinned_state: this.getNodeParameter('pinned_state', i, 0) as number,
						encrypted_state: this.getNodeParameter('encrypted_state', i, 0) as number,
						content_type: this.getNodeParameter('content_type', i, '') as string,
					};
					const responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}${FILTER_OP_PATHS[operation]}`,
						headers: authHeader,
						qs,
					}) as IDataObject;
					returnData.push({ json: responseData, pairedItem: i });
					continue;
				}

				// ── Pin by CID ───────────────────────────────────────────────
				if (operation === 'pinByCid') {
					const cid = this.getNodeParameter('cid', i) as string;
					const responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/pin_ipfs_cid_for_apikey`,
						headers: authHeader,
						qs: { cid },
					}) as IDataObject;
					returnData.push({ json: responseData, pairedItem: i });
					continue;
				}

				// ── Remove by CID ────────────────────────────────────────────
				if (operation === 'removeByCid') {
					const cid = this.getNodeParameter('cid', i) as string;
					const responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/remove_ipfs_cid_from_account`,
						headers: authHeader,
						qs: { cid },
					}) as IDataObject;
					returnData.push({ json: responseData, pairedItem: i });
					continue;
				}

				// ── Publish to Web ───────────────────────────────────────────
				if (operation === 'publishToWeb') {
					const cid = this.getNodeParameter('cid', i) as string;
					const responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/publish_ipfs_file_to_webserver`,
						headers: authHeader,
						qs: { cid },
					}) as IDataObject;
					returnData.push({ json: responseData, pairedItem: i });
					continue;
				}

				// ── Upload File (multipart) ──────────────────────────────────
				if (operation === 'uploadFile') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
					const nicknameOnIPFS = this.getNodeParameter('nicknameOnIPFS', i, '') as string;
					const doEncryptOnIPFS = this.getNodeParameter('doEncryptOnIPFS', i, false) as boolean;

					const responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/upload_sender_file_to_ipfs_for_apikey`,
						headers: authHeader,
						qs: {
							nicknameOnIPFS,
							doEncryptOnIPFS: doEncryptOnIPFS ? 'true' : 'false',
						},
						body: {
							file: {
								value: buffer,
								options: {
									filename: binaryData.fileName ?? 'upload',
									contentType: binaryData.mimeType ?? 'application/octet-stream',
								},
							},
						},
					}) as IDataObject;
					returnData.push({ json: responseData, pairedItem: i });
					continue;
				}

				// ── Upload Base64 ────────────────────────────────────────────
				if (operation === 'uploadBase64') {
					const base64_data = this.getNodeParameter('base64_data', i) as string;
					const nicknameOnIPFS = this.getNodeParameter('nicknameOnIPFS', i, '') as string;
					const doEncryptOnIPFS = this.getNodeParameter('doEncryptOnIPFS', i, false) as boolean;
					const responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/upload_sender_base64_to_ipfs_for_apikey`,
						headers: authHeader,
						qs: {
							base64_data,
							nicknameOnIPFS,
							doEncryptOnIPFS: doEncryptOnIPFS ? 'true' : 'false',
						},
					}) as IDataObject;
					returnData.push({ json: responseData, pairedItem: i });
					continue;
				}

				// ── Retrieve File (binary output) ────────────────────────────
				if (operation === 'retrieveFile') {
					const cid = this.getNodeParameter('cid', i) as string;
					const outputField = this.getNodeParameter('outputBinaryPropertyName', i, 'data') as string;

					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/retrieve_ipfs_file_for_apikey`,
						headers: authHeader,
						qs: { cid },
						encoding: 'arraybuffer',
						returnFullResponse: true,
					}) as { body: ArrayBuffer; headers: Record<string, string> };

					const contentType = response.headers['content-type'] ?? 'application/octet-stream';
					const binary = await this.helpers.prepareBinaryData(
						Buffer.from(response.body),
						`ipfs_${cid}`,
						contentType,
					);
					returnData.push({
						json: { cid },
						binary: { [outputField]: binary },
						pairedItem: i,
					});
					continue;
				}

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
