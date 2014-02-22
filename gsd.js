var gameserver = require('./gameprocess');
var restify = require('restify');
var config = require('./config.json');

var servers = [];

Object.keys(config.servers).forEach(function(item, index) {
    data = config.servers[index];
    servers[index] = new gameserver(data);
    
    servers[index].console = require('socket.io').listen(data.consoleport);

    servers[index].on('console', function(data){
	servers[index].console.sockets.emit('console', {'l':data.toString()});
    });
    
    servers[index].on('off', function(data){
	servers[index].console.sockets.emit('console', {'l':data.toString()});
    });

    servers[index].on('statuschange', function(data) {
	servers[index].console.sockets.emit('statuschange', {'status':servers[index].status});
    });
    
    servers[index].console.on('sendconsole', function (command) {
	console.log(command);
    });
      
});
    




var restserver = restify.createServer();
restserver.use(restify.bodyParser());
restserver.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);

restserver.get('/gameservers/:id', function info(req, res, next){gameserver = servers[req.params.id]; res.send(gameserver.info());});
restserver.get('/gameservers/:id/on', function on(req, res, next){gameserver = servers[req.params.id]; gameserver.turnon();res.send('ok')});
restserver.get('/gameservers/:id/off', function off(req, res, next){gameserver = servers[req.params.id]; gameserver.turnoff();res.send('ok')});
restserver.get('/gameservers/:id/restart', function restart(req, res, next){gameserver = servers[req.params.id]; gameserver.restart();res.send('ok')});
restserver.get('/gameservers/:id/configlist', function configlist(req, res, next){gameserver = servers[req.params.id]; res.send(gameserver.configlist());});
restserver.get('/gameservers/:id/maplist', function maplist(req, res, next){gameserver = servers[req.params.id]; res.send(gameserver.maplist());});
restserver.get('/gameservers/:id/query', function query(req, res, next){gameserver = servers[req.params.id]; res.send(gameserver.lastquery());});

restserver.post('/gameservers/:id/console', function command(req, res, next){gameserver = servers[req.params.id]; gameserver.send(req.params.command); console.log("D");res.send('ok');});

restserver.get('/gameservers/:id/addonsinstalled', function command(req, res, next){gameserver = servers[req.params.id]; res.send(gameserver.addonlist());});

restserver.get(/^\/gameservers\/(\d+)\/file\/(.+)/, function(req, res, next) {gameserver = servers[req.params[0]];res.send({'contents':gameserver.readfile(req.params[1])});});
restserver.put(/^\/gameservers\/(\d+)\/file\/(.+)/, function(req, res, next) {
  if ('contents' in req.params){    
    gameserver = servers[req.params[0]];res.send(gameserver.writefile(req.params[1], req.params['contents']));
  }
  if ('url' in req.params){
    gameserver = servers[req.params[0]];res.send(gameserver.downloadfile(req.params['url'], req.params[1]));
  }
});
// TODO : put send



restserver.listen(config.daemon.listenport, function() {
  console.log('%s listening at %s', restserver.name, restserver.url);
});


