
mcping = require('mc-ping');
fs = require('fs');
pathlib = require('path');
glob = require("glob")

var settings = {};
settings.stop_command = 'stop'
settings.started_trigger = ')! For help, type "help" or "?"'
settings.defaultvariables = {"-Xmx":"512M", "-jar":"minecraft_server.jar"}
settings.exe = "java",

settings.query = function query(self){
  var result =  mcping(self.config.gamehost, self.config.gameport, function(err, res) {
    if (err) {
        console.error("Couldn't query server, please check the IP / port are configured correctly and query is enabled");
        self.emit('crash');
        return null;

    } else {
        self.hostname = res['server_name'];	
        self.numplayers = res['num_players'];
        self.maxplayers = res['max_players'];
	self.lastquerytime = new Date().getTime();
    }
  });  
};

settings.maplist = function maplist(self){
    maps = [];

    fs.readdirSync(self.config.path).forEach(function(directory){
      
      path = pathlib.join(self.config.path, directory); 
      
      if (fs.lstatSync(path).isDirectory()){
	if (fs.existsSync(pathlib.join(path, "level.dat"))){
	  maps.push(directory)
	}
      }
    });
    
    return maps;
};

settings.configlist = function configlist(self){
  var configs = {};
  
  glob("*.txt", {'cwd':self.config.path, 'sync':true}, function (er, files) {
    configs['core'] = files;
  });
  
  if (fs.existsSync(pathlib.join(self.config.path, "plugins"))){
    glob("plugins/*/*.yml", {'cwd':self.config.path, 'sync':true}, function (er, files) {
      configs['plugins'] = files;
    });
  }
  
  return configs;
};

settings.addonlist = function addonlist(self){
  var addons = {};
  
  if (fs.existsSync(pathlib.join(self.config.path, "plugins"))){
    glob("plugins/*.jar", {'cwd':self.config.path, 'sync':true}, function (er, files) {
      addons['bukkit'] = files;
    });
  }
  
  return addons;
};

module.exports = settings;