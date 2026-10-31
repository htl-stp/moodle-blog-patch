import { compressJson, decompressJson } from './compression';
import {ConfigData, ConfigSchema, EncodedConfigSchema, LegacyConfigSchema} from './types';
import {CONFIG_VERSION, READABLE_CONFIG_VERSIONS} from "./constants";

export class Config {
	constructor(public data: ConfigData) {}

	private static async decodeRawConfig(raw: string): Promise<ConfigData> {
		const json = JSON.parse(raw);

		const safe = EncodedConfigSchema.safeParse(json);

		if (safe.error) {
			return LegacyConfigSchema.parse(json);
		}

		const encoded = safe.data;

		const versionOk = READABLE_CONFIG_VERSIONS.includes(encoded.v);
		const formatOk = ['gzip', 'none'].includes(encoded.format);

		if (!versionOk || !formatOk) {
			throw new Error('Invalid Config');
		}

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
