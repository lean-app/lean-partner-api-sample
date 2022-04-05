const { spawn } = require('child_process');
const { Observable, concat } = require('rxjs');

const handleProcessData = (observer) => (data) => observer?.next?.(data);
const handleProcessError = (observer) => (error) => observer?.error?.(error);
const handleProcessClose = (observer) => (code) => (code === 0 && observer?.complete?.()) || observer?.error?.(code);

const command = (input, options = { silent: false }) =>  {
  const commandParts = input.split('&&');
  const commands = commandParts.map((command) => command.trim())
    .map((commandString) => {
      const [ command, ...args ] = commandString.split(' ');
      return [ command, [ ...args ] ];
    })


  const call = (command, args) => new Observable((observer) => { 
    const proc = spawn(command, args, {
      cwd: options?.cwd,
    });
    
    const processDataHandler = handleProcessData(observer);
    const processErrorHandler = handleProcessError(observer);
    const processCloseHandler = handleProcessClose(observer);

    proc.stdout.on('data', processDataHandler);
    proc.stderr.on('data', processErrorHandler)

    proc.on('message', processDataHandler);
    proc.on('error', processErrorHandler);
    proc.on('exit', processCloseHandler);
    proc.on('close', processCloseHandler);
    proc.on('disconnect', processCloseHandler);
  });

  return concat(...commands.map(([ command, args ]) => call(command, args)));
};

module.exports = {
  command
};