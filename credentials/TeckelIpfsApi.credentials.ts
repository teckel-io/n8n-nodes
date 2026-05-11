import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class TeckelIpfsApi implements ICredentialType {
	name = 'teckelIpfsApi';
	displayName = 'Teckel IPFS API';
	documentationUrl =
		'https://github.com/teckel-io/n8n-nodes/tree/main/n8n-nodes-teckel-ipfs#readme';
	icon: Icon = 'file:../nodes/TeckelIpfs/teckel-ipfs.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mcp-servers.bh.tkllabs.io:9780',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{ "Bearer " + $credentials.apiKey }}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ $credentials.baseUrl }}',
			url: '/get_ipfs_content_for_apikey',
			method: 'POST',
			qs: {
				search_string: '',
				pinned_state: 0,
				encrypted_state: 0,
				content_type: '',
			},
		},
	};
}
