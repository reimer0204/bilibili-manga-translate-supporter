const webpack = require('webpack');

module.exports = {
	filenameHashing: false,
	productionSourceMap: false,
	configureWebpack: {
		node: {
			global: false
		},
		plugins: [
			new webpack.DefinePlugin({
				global: "window"
			})
		]
	}
};