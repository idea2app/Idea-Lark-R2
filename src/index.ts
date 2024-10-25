import { LarkApp } from './lark';

export interface Env
	extends Record<
		| 'BUCKET_BASE_URL'
		| 'LARK_HOST'
		| 'LARK_ID'
		| 'LARK_SECRET'
		| 'LARK_UPLOAD_KEY',
		string
	> {
	R2_BUCKET: R2Bucket;
}

const larkClient = new LarkApp();

export default {
	async fetch(request, env): Promise<Response> {
		if (request.method !== 'PUT' && request.method !== 'POST')
			return new Response(`Unsupported method`, { status: 405 });

		const url = new URL(request.url);

		const {
			LARK_ID,
			LARK_SECRET,
			LARK_HOST,
			LARK_UPLOAD_KEY,
			R2_BUCKET,
			BUCKET_BASE_URL
		} = env;

		/**
		 * @param {string} AUTH_HEADER_KEY Custom header to check for key
		 */
		const AUTH_HEADER_KEY = 'X-Lark-Upload-Token',
			passKey = request.headers.get(AUTH_HEADER_KEY);

		/**
		 * Upload file from lark to r2
		 */
		if (passKey !== LARK_UPLOAD_KEY)
			return new Response(`Invalid upload token`, { status: 401 });

		let searchParams: { [key: string]: string } = {};

		for (const [key, value] of url.searchParams) searchParams[key] = value;

		/**
		 * @param {string} file_token File token of lark image
		 * @param {string} name Name of the file
		 * @param {string} type Type of the file (image)
		 */
		const { file_token = '', name = '', type = '' } = searchParams;

		larkClient.init({ id: LARK_ID, secret: LARK_SECRET, host: LARK_HOST });

		let files: string[] = [];

		const file_token_array = file_token.split(','),
			name_array = name.split(','),
			type_array = type.split(',');

		const uploadPromises = file_token_array.map(
			async (file_token, index) => {
				const file = await larkClient.downloadFile(file_token);
				const key = `${file_token_array[index]}.${type_array[index].split('/')[1]}`;

				await R2_BUCKET.put(key, file, {
					httpMetadata: request.headers
				});

				files[index] = `${BUCKET_BASE_URL}/${key}`;
			}
		);

		await Promise.all(uploadPromises);

		return new Response(JSON.stringify({ files }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}
} satisfies ExportedHandler<Env>;
