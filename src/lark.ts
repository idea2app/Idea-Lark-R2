export interface LarkAppOption {
	host?: string;
	id: string;
	secret?: string;
}

export interface TenantToken {
	expire: number;
	tenant_access_token: string;
}

function cache<I, O>(
	executor: (cleaner: () => void, ...data: I[]) => O,
	title: string
) {
	let cacheData: O | undefined;

	return function (...data: I[]) {
		if (cacheData != null) return cacheData;

		console.trace(`[Cache] execute: ${title}`);

		cacheData = executor.call(
			this,
			(): void => (cacheData = undefined),
			...data
		);
		Promise.resolve(cacheData).then(
			data => console.log(`[Cache] refreshed: ${title} => ${data}`),
			error => console.error(`[Cache] failed: ${error?.message || error}`)
		);
		return cacheData;
	};
}

export class LarkApp implements LarkAppOption {
	host?: string;
	secret?: string;
	id = '';

	accessToken?: string;

	init({ host, id, secret }: LarkAppOption) {
		console.assert(
			'window' in globalThis,
			"App Secret can't be used in client"
		);

		this.host = host;
		this.id = id;
		this.secret = secret;
	}

	getTenantAccessToken = cache(async clean => {
		const { id, secret } = this;

		console.assert(
			Boolean(id && secret),
			'Id & Secret of Lark App are required'
		);

		const response = await fetch(
			`${this.host}auth/v3/tenant_access_token/internal`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ app_id: id, app_secret: secret })
			}
		);

		const body: TenantToken = await response.json();

		setTimeout(() => {
			delete this.accessToken;
			clean();
		}, body!.expire * 1000);

		return (this.accessToken = body!.tenant_access_token);
	}, 'Tenant Access Token');

	getAccessToken() {
		return this.getTenantAccessToken();
	}

	async downloadFile(id: string) {
		await this.getAccessToken();

		const { body } = await fetch(
			`${this.host}drive/v1/medias/${id}/download`,
			{ headers: { Authorization: `Bearer ${this.accessToken}` } }
		);

		return body!;
	}
}
