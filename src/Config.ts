import { compressJson, decompressJson } from './compression';
import {CONFIG_VERSION, ConfigData, ConfigSchema, EncodedConfigSchema} from './types';


export class Config {
	constructor(public data: ConfigData) {}

	private static async decodeRawConfig(raw: string): Promise<ConfigData> {
		const encoded = EncodedConfigSchema.parse(JSON.parse(raw));

		if (encoded.format === 'gzip') {
			const json = JSON.parse(await decompressJson(encoded.configPayload));

			return ConfigSchema.parse(json);
		} else {
			return ConfigSchema.parse(JSON.parse(encoded.configPayload));
		}
	}

	static async fromDescription(raw: string): Promise<Config> {
		const configData = await this.decodeRawConfig(raw);

		return new Config(configData);
	}

	private async encodeConfig() {
		const json = JSON.stringify(this.data);

		const encodedConfig = await compressJson(json);

		return JSON.stringify({
			v: CONFIG_VERSION,
			format: 'gzip',
			configPayload: encodedConfig,
		});
	}

	async serialize() {
		const serialized = await this.encodeConfig();

		return serialized;
	}
}
