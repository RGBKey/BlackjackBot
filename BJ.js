var Util = require('util.js');
class BJ {
	constructor(numDecks, minBet, maxBet, out, pm){
		this.min = minBet;
		this.max = maxBet;
		this.out = out;
		this.pm = pm;
		this.blackjack = 2.2;
		this.players = [];
		this.gameOver = false;
		let cards = [
			['A♣','ace'],['2♣',2],['3♣',3],['4♣',4],['5♣',5],['6♣',6],['7♣',7],['8♣',8],['9♣',9],['10♣',10],['J♣',10],['Q♣',10],['K♣',10],
			['A♦','ace'],['2♦',2],['3♦',3],['4♦',4],['5♦',5],['6♦',6],['7♦',7],['8♦',8],['9♦',9],['10♦',10],['J♦',10],['Q♦',10],['K♦',10],
			['A♥','ace'],['2♥',2],['3♥',3],['4♥',4],['5♥',5],['6♥',6],['7♥',7],['8♥',8],['9♥',9],['10♥',10],['J♥',10],['Q♥',10],['K♥',10],
			['A♠','ace'],['2♠',2],['3♠',3],['4♠',4],['5♠',5],['6♠',6],['7♠',7],['8♠',8],['9♠',9],['10♠',10],['J♠',10],['Q♠',10],['K♠',10]
		];
		this.deck = cards;
		for(var i = 1; i < numDecks; i++){
			this.deck = this.deck.concat(cards);
		}
		this.shuffle();
	}
	shuffle(){
		let array = Array.from(this.deck);
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    this.deck = array;
	}
	addPlayer(id, username, bet){
		this.players.push({
			id: id,
			username: username,
			name: username,
			bet: bet,
			cards: [],
			split: 1,
			paid: false
		});
	}
	clearPlayers(){
		this.players = [];
	}
	sum(cards){
		var aces = 0;
		for(var i = 0; i < cards.length; i++){
			if(cards[i][1] == 'ace'){
				aces++;
			}
		}
		var sum = 0;
		for(var i = 0; i < cards.length; i++){
			if(cards[i][1] != 'ace'){
				sum += cards[i][1];
			}
		}
		for(var i = 0; i < aces; i++){
			if(sum + 11 > 21){
				sum += 1;
			} else {
				sum += 11;
			}
		}
		return sum;
	}
	aces(cards){
		var aces = 0;
		for(var i = 0; i < cards.length; i++){
			if(cards[i][1] == 'ace'){
				aces++;
			}
		}
		return aces;
	}
	playGame(callback){
		if(this.players.length < 1){
			out('Error: Must have at least 1 player.');
			return;
		}
		//Deal all players 2 cards
		this.players.forEach((player) => {
			player.cards.push(this.deck.pop());
			player.cards.push(this.deck.pop());
		});
		//Deal the dealer 2 cards
		this.dealer = [];
		this.dealer.push(this.deck.pop());
		this.dealer.push(this.deck.pop());
		this.printState();
		//Check for dealer blackjack
		if(this.sum(this.dealer) == 21){
			this.out('Dealer has blackjack');
			this.endGame();
		}
		this.turn = -1;
		this.waitingOn = 'hit';
		this.nextTurn();
		callback();
	}
	endGame(){
		var dealerScore = this.sum(this.dealer);
		while(dealerScore < 17 || (dealerScore == 17 && this.aces(this.dealer) > 0)){
			this.dealer.push(this.deck.pop());
			dealerScore = this.sum(this.dealer);
		}
		var winners = [];
		for(var i = 0; i < this.players.length; i++){
			var player = this.players[i];
			var playerScore = this.sum(player.cards);
			if(playerScore <= 21){
				if(dealerScore > 21){
					this.pay(player, player.bet * 2);
					winners.push(player.name);
				} else if(playerScore > dealerScore){
					this.pay(player, player.bet * 2);
					winners.push(player.name);
				} else if(playerScore == dealerScore){
					this.pay(player, player.bet);
				}
			}
		}
		var output = 'Congratulations to ';
		for(var i = 0; i < winners.length; i++){
			if(i == winners.length - 1){
				output += winners[i];
			} else if(winners.length >= 2 && i == winners.length - 2){
				output += winners[i] + ' & ';
			} else if(winners.length >= 3 && i <= winners.length - 3){
				output += winners[i] + ', ';
			}
		}
		this.gameOver = true;
		this.printState();
		this.out(output);
	}
	nextTurn(){
		if(this.turn + 1 < this.players.length){
			console.log('Next turn');
			this.turn++;
			this.playerId = this.players[this.turn].id;
			var player = this.players[this.turn];
			if(this.sum(player.cards) == 21){
				this.pay(player, player.bet * this.blackjack)
				this.out(`${player.name} got a blackjack!`);
				this.nextTurn();
			} else {
				this.prompt();
			}
		} else {
			this.playerId = false;
			this.waitingOn = false;
			this.endGame();
		}
	}
	get whoseTurn(){
		return this.players[this.turn];
	}
	printState(){
		//Output a string detailing the player's cards
		let beginningString = `DEALER: `;
		for(var i = 0; i < this.dealer.length; i++){
			if(i > 0 && !this.gameOver){
				beginningString += `[ ]`;
			} else {
				beginningString += `[${this.dealer[i][0]}]`;
			}
		}
		for(var i = 0; i < this.players.length; i++){
			var player = this.players[i];
			beginningString += ` | ${player.name}: `;
			for(var j = 0; j < player.cards.length; j++){
				var card = player.cards[j];
				beginningString += `[${card[0]}]`;
			}
		}
		this.out(beginningString);
	}
	prompt(output){
		output = output || '';
		var player = this.players[this.turn];
		var name = player.name;
		switch(this.waitingOn){
			case 'hit':
				output += `${name}, you have ${this.sum(player.cards)}. (h)it or (s)tand?`;
		}
		this.pm(player.id, output);
	}
	hit(){
		console.log('Hitting');
		var player = this.players[this.turn];
		player.cards.push(this.deck.pop());
		var output = '';
		if(this.sum(player.cards) > 21){
			output += `You drew [${player.cards[player.cards.length-1][0]}] and have ${this.sum(player.cards)}. You bust`;
			this.pm(player.id, output);
			this.nextTurn();
		} else {
			output += `You drew [${player.cards[player.cards.length-1][0]}] and have ${this.sum(player.cards)}. (h)it or (s)tand?`;
			this.pm(player.id, output);
		}
	}
	stand(){
		console.log('Standing');
		this.nextTurn();
	}
	split(){
		var temp = this.players[this.turn];
		this.players.splice(this.turn, 0, temp);
		var player1 = this.players[this.turn];
		var player2 = this.players[this.turn+1];
		player1.split++;
		player2.split++;
		player1.name = `${player1.username}(${player1.split - 1})`;
		player2.name = `${player2.username}(${player2.split})`;
		player2.cards.splice(1,1);
		player2.cards[0] = player1cards.splice(1,1)[0];
		player1.cards.push(this.deck.pop());
		player2.cards.push(this.deck.pop());
		this.printState();
	}
	get canSplit(){
		var player = this.players[this.turn];
		if(player.cards.length == 2 && player.cards[0][1] == player.cards[1][1] && player.split <= 1){
			return true;
		} else {
			return false;
		}
	}
	double(){
		var player = this.players[this.turn];
		player.bet *= 2;
		player.cards.push(this.deck.pop());
		this.nextTurn();
	}
	pay(player, amount){
		if(!player.paid){
			player.paid = true;
			//this.out(`./tip noconf ${player.id} ${amount.toPrecision(8)}`);
			console.log(`./tip noconf ${player.id} ${amount.toPrecision(8)}`);
		}
	}
}
module.exports = BJ;
