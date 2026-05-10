import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class TeckelNavigationApi implements ICredentialType {
	name = 'teckelNavigationApi';
	displayName = 'teckel Navigation API';
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
}
