const path = require('path');

const Hapi = require('@hapi/hapi');
const H2o2 = require('@hapi/h2o2');
const Inert = require('@hapi/inert');
const Log = require('@hapi/log');

const server = Hapi.server({
    port: 8000,
    routes: {
        files: {
            relativeTo: path.join(__dirname, 'build')
        }
    },
    debug: {
        request: '*'
    }
});

const start = async function() {
  try {
    await server.register(H2o2);
    await server.register(Inert);
    await server.register(Log);

    server.route({
        method: '*',
        path: '/api/{endpoint*}',
        handler: {
            proxy: {
                host: `app.staging.withlean.com`,
                port: '443',
                protocol: 'https',
                passThrough: true
            }
        }
    });


    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            proxy: {
                host: 'localhost',
                port: '3000',
                protocol: 'http',
                passThrough: true
            }
        }
    });

    await server.start();

    console.log(`Server started at:  ${server.info.uri}`);
  }
  catch(e) {
    console.log('Failed to load h2o2');
  }
}

start();