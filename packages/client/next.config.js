require('dotenv').config();
const path = require('path');
const Dotenv = require('dotenv-webpack');
const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules');
const withOptimizedImages = require('next-optimized-images');
const withFonts = require('next-fonts');
const withCSS = require('@zeit/next-css');

// next.js configuration
const nextConfig = {
	webpack: (config, { isServer }) => {
		config.plugins = config.plugins || [];
		config.plugins = [
			...config.plugins,
			new Dotenv({
				path: path.join(__dirname, '.env'),
				systemvars: true
			})
		];

		config.resolve.alias = {
			...config.resolve.alias,
			palette: 'palette'
		};
		return config;
	}
};

module.exports = withPlugins(
	[
		[
			withTM,
			{
				transpileModules: ['palette']
			}
		],
		withOptimizedImages,
		withFonts,
		withCSS
	],
	nextConfig
);
