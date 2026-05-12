import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class TeckelNavigationApi implements ICredentialType {
	name = 'teckelNavigationApi';
	displayName = 'Teckel Navigation API';
	documentationUrl =
		'https://github.com/teckel-io/n8n-nodes/tree/main/n8n-nodes-teckel-navigation#readme';
	icon: Icon = 'file:../nodes/TeckelNavigation/teckel-navigation.svg';

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
			url: '/get_api_navigation_help',
			method: 'POST',
		},
	};
}
