const crypto = require('crypto');
const { createTransformer } = require('babel-jest');
const getBabelCommonConfig = require('../getBabelCommonConfig');
const rewriteSource = require('./rewriteSource');
const pkg = require('../../package.json');

const libDir = process.env.LIB_DIR || 'src';

function processDemo({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        rewriteSource(t, path, libDir);
      },
    },
  };
}

module.exports = {
  canInstrument: true,
  process(src, path, config, transformOptions) {
    global.__clearBabelAntdPlugin && global.__clearBabelAntdPlugin(); // eslint-disable-line
    const babelConfig = getBabelCommonConfig();
    babelConfig.plugins = [...babelConfig.plugins];

    if (/\/demo\//.test(path)) {
      babelConfig.plugins.push(processDemo);
    }

    const babelSupport = path.endsWith('.js');

    const babelJest = createTransformer(babelConfig);
    const fileName = babelSupport ? path : 'file.js';
    return babelJest.process(src, fileName, config, transformOptions);
  },

  getCacheKey() {
    return crypto
      .createHash('md5')
      .update('\0', 'utf8')
      .update(libDir)
      .update('\0', 'utf8')
      .update(pkg.version)
      .digest('hex');
  },
};
