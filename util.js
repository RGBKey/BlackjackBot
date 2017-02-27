var chalk = require('chalk');
var request = require('request');
var fs = require('fs');
class Util {
	static read(filename, callback){
		this.log(`Reading ${filename}`);
		fs.readFile(__dirname + '/' + filename, (err, data) => {
			if(err){
				this.important(`Error reading ${filename}`);
			} else {
				callback(JSON.parse(data));
			}
		});
	}
	static save(filename, data){
		data = JSON.stringify(data);
		filename = __dirname + '/' + filename;
		fs.writeFileSync(filename, data);
	}
	static write(msg){
		var ahead = new Date();
		ahead = ahead.getTime() - 1000*60*60*5;
		var date = new Date(ahead);
		console.log(`${chalk.cyan('['+date.toLocaleTimeString()+']')} ${msg}`);
	}
	static log(msg){
		this.write(msg);
	}
	static important(msg){
		this.write(chalk.red(msg));
	}
	static timePassed(date, callback){
		var then = new Date(date);
		var now = new Date();
		var diff = now.getTime() - then.getTime();
		var days = Math.floor(diff / 86400000);
		diff %= 86400000;
		var hours = Math.floor((diff / 3600000));
		diff %= 3600000;
		var minutes = Math.floor(diff / 60000);
		diff %= 60000;
		var seconds = Math.floor(diff / 1000);
		var output = '';
		if(days && (hours || minutes || seconds)){
			output += `${days} days, `;
		} else if (days){
			output += `${days} days`;
		}
		if(hours && (minutes || seconds)){
			output += `${hours} hours, `;
		} else if (hours){
			output += `${hours} hours`;
		}
		if(minutes && seconds){
			output += `${minutes} minutes, `;
		} else if (minutes){
			output += `${minutes} minutes`;
		}
		if(seconds){
			output += `${seconds} seconds`;
		}
		callback(output);
	}
	static urban(term, callback){
		request(`http://urbanscraper.herokuapp.com/define/${term}`, (err, res, body) => {
			if(!err && res.statusCode == 200){
				var dic = JSON.parse(body);
				callback(`Definition: ${dic.definition} Example: ${dic.example}`);
			} else {
				callback(false);
			}
		});
	}
	static balance(addr, callback){
		request(`http://khashier.com/chain/Clam/q/addressbalance/${addr}`, (err, res, body) => {
			if(!err && res.statusCode == 200){
				callback(body);
			} else {
				callback(false);
			}
		});
	}
}
module.exports = Util;
