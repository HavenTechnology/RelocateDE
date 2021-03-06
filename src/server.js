/**
 * HANWEN CHENG 04.01.2016
 */

import Express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import config from './config';
import favicon from 'serve-favicon';
import compression from 'compression';
import httpProxy from 'http-proxy';
import path from 'path';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import Html from './helpers/Html';
import PrettyError from 'pretty-error';
import http from 'http';
import https from 'https';
import constants from 'constants';

import {ReduxRouter} from 'redux-router';
import createHistory from 'history/lib/createMemoryHistory';
import {reduxReactRouter, match} from 'redux-router/server';
import {Provider} from 'react-redux';
import qs from 'query-string';
import getRoutes from './routes';
import getStatusFromRoutes from './helpers/getStatusFromRoutes';
import fs from 'fs';

const targetUrl = 'http://' + config.apiHost + ':' + config.apiPort;
const pretty = new PrettyError();
const app = new Express();

var keypath  = path.join(__dirname, '..', '..', 'aws', 'omzugssh.pem')
var certPath = path.join(__dirname, '..', '..', 'aws', 'www.crt')
var caPath = path.join(__dirname, '..', '..', 'aws', 'ca.crt')

var server;

// if (process.env.NODE_ENV == 'production') {
//
//   server = https.createServer({
//     key: fs.readFileSync(keypath),
//     ca : fs.readFileSync(caPath),
//     cert: fs.readFileSync(certPath),
//     secureProtocol: 'SSLv23_method',
//     honorCipherOrder: true,
//     secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2
//   }, app);
//
//   // set up plain http server, no need to use http
//   var httpApp = new Express()
//   // set up a route to redirect http to https
//   httpApp.get('*',function(req, res){
//     res.redirect('https://www.omzug.com'+req.url)
//     console.log("receive request " + req.url)
//   })
//
// // have it listen on 8080
//   httpApp.listen(8080);
//
// }else{
  server = new http.Server(app);
// }



const proxy = httpProxy.createProxyServer({
  target: targetUrl,
  ws: true
});

app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon32.png')));

app.use(Express.static(path.join(__dirname, '..', 'static')));

// Proxy to API server
app.use('/api', (req, res) => {
  proxy.web(req, res, {target: targetUrl});
});

app.use('/ws', (req, res) => {
  proxy.web(req, res, {target: targetUrl + '/ws'});
});

//Material-UI expects the global navigator.userAgent to be defined for server-side rendering.
// Set this property when receiving the request headers.
app.use(function(req, res, next) {
  GLOBAL.navigator = {
    userAgent: req.headers['user-agent']
  }
  next();
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// added the error handling to avoid https://github.com/nodejitsu/node-http-proxy/issues/527
proxy.on('error', (error, req, res) => {
  let json;
  if (error.code !== 'ECONNRESET') {
    console.error('proxy error', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, {'content-type': 'application/json'});
  }

  json = {error: 'proxy_error', reason: error.message};
  res.end(JSON.stringify(json));
});

app.use((req, res) => {
  if (__DEVELOPMENT__) {
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }

  // instantiate api client
  const client = new ApiClient(req);

  const store = createStore(reduxReactRouter, getRoutes, createHistory, client);

  // render without component, disable server side rendering
  function hydrateOnClient() {
    res.send('<!doctype html>\n' +
      ReactDOM.renderToString(<Html assets={webpackIsomorphicTools.assets()} store={store}/>));
  }

  if (__DISABLE_SSR__) {
    hydrateOnClient();
    return;
  }

  store.dispatch(match(req.originalUrl, (error, redirectLocation, routerState) => {
    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      console.error('ROUTER ERROR:', pretty.render(error));
      res.status(500);
      hydrateOnClient();
    } else if (!routerState) {
      res.status(500);
      hydrateOnClient();
    } else {
      // Workaround redux-router query string issue:
      // https://github.com/rackt/redux-router/issues/106
      if (routerState.location.search && !routerState.location.query) {
        routerState.location.query = qs.parse(routerState.location.search);
      }

      store.getState().router.then(() => {
        const component = (
          <Provider store={store} key="provider">
            <ReduxRouter/>
          </Provider>
        );

        const status = getStatusFromRoutes(routerState.routes);
        if (status) {
          res.status(status);
        }
        res.send('<!doctype html>\n' +
          ReactDOM.renderToString(<Html assets={webpackIsomorphicTools.assets()} component={component} store={store}/>));
      }).catch((err) => {
        console.error('DATA FETCHING ERROR:', pretty.render(err));
        res.status(500);
        hydrateOnClient();
      });
    }
  }));
});

if (config.port) {
  server.listen(config.port, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> ✅  %s is running, talking to API server on %s.', config.app.title, config.apiPort);
    console.info('==> 💻  Open http://%s:%s in a browser to view the app.', config.host, config.port);
  });
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
