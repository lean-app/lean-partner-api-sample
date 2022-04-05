const { spawn } = require('child_process');
const { Observable } = require('rxjs');
const { tap, reduce } = require('rxjs/operators');

const handleProcessData = (observer) => (buffer) => observer?.next?.({ data: buffer.toString() });
const handleProcessError = (observer) => (buffer) => observer?.next?.({ error: buffer.toString() });
const handleProcessClose = (observer) => (code) => (code === 0 && observer?.complete?.()) || observer?.error?.(code);

const command = (input, options = { silent: false, verbose: false }) =>  {
  const [ command, ...args ] = input.split(' ');

  return new Observable((observer) => { 
    const proc = spawn(command, args, {
      cwd: options?.cwd,
    });
    
    const processDataHandler = handleProcessData(observer);
    const processErrorHandler = handleProcessError(observer);
    const processCloseHandler = handleProcessClose(observer);

    proc.stdout.on('data', processDataHandler);
    proc.stderr.on('data', processErrorHandler);

    proc.on('message', processDataHandler);
    proc.on('error', processErrorHandler);
    proc.on('exit', processCloseHandler);
    proc.on('close', processCloseHandler);
    proc.on('disconnect', processCloseHandler);
  }).pipe(
    tap(({ data, error }) => options.verbose && console.log(data || error)),
    reduce(() => { }),
  );
};

module.exports = {
  command
};