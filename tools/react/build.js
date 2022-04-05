const path = require('path');
const { command } = require('../cli');
const { concat } = require('rxjs');
(async () => {
  concat(
    command(`npm run build`, {
      cwd: path.join(__dirname, '../../react-app')
    })
  ).subscribe({
    next: (buffer) => console.log(buffer.toString()),
    complete: () => console.log('Build complete'),
  });
})();