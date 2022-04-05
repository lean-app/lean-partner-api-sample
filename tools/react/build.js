const call = require('../cli');

(async () => {
  await call(`cd ../../react-app && npm run build`);
})();