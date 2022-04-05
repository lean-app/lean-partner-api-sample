export const call = async (command, { silent = false } = { }) =>  (new Promise ((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(error.trim() || stderr.trim());
      return reject(error.trim() || stderr.trim());
    }

    if (!silent) {
      console.log(stdout.trim());
      return resolve(stdout.trim());
    }

    return resolve();
  })
}));