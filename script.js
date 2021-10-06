let blackjackGame = {
	'you': {'scoreSpan': '#yourScore', 'div': '#playerSide', 'score': 0},
	'dealer': {'scoreSpan': '#dealerScore', 'div': '#dealerSide', 'score': 0},
	'cards': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
	'cardsMap': {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': [1, 11]},
	'wins': 0,
	'losses': 0,
	'draws': 0,
	'isStand': false,
	'turnsOver': false,
	'isHit': false,
	'notHit': false,
	'quotes': ['Game On!', "Let's Go!", 'Again?!']
}

window.onload = function(){
    parent._alert = new parent.Function("alert(arguments[0]);");
	parent._alert("Rule: Click Hit to pick a card at random, keep clicking till you get a number close to 21 or 21 itself. \n" +
				"Going over 21 will make you BUST thus losing the round. \n Click Stand when you're done so the bot plays its turn."+ 
				"The bot's turn is automated, so you can only click Stand once per round. \n Whoever has the highest number wins the round."+ 
				"Click Deal clear the board for the next round. \n NB: Ace counts as 1 or 11. J, Q, K count as 10.");
}

const YOU = blackjackGame['you'];
const DEALER = blackjackGame['dealer'];

const hitSound = new Audio('sounds/swish.m4a');
const winSound = new Audio('sounds/cash.mp3');
const lossSound = new Audio('sounds/aww.mp3');

document.querySelector('#hitButton').addEventListener('click', blackjackHit);
document.querySelector('#standButton').addEventListener('click', blackjackStand);
document.querySelector('#dealButton').addEventListener('click', blackjackDeal);

function blackjackHit() {
	if (YOU['score'] <= 21 && blackjackGame['notHit'] === false) {
		blackjackGame['isHit'] = true;

		if (blackjackGame['isStand'] === false) {
			let card = randomCard();
			console.log(card);
			showCard(card, YOU);
			updateScore(card, YOU);
			showScore(YOU);
			console.log(YOU['score']);
		}

		blackjackStand.onclick = 0;
	}
}

function randomCard() {
	let randomIndex = Math.floor(Math.random() * 13);
	return blackjackGame['cards'][randomIndex];
}

function gameQuotes() {
	let randomQuotes = Math.floor(Math.random() * 3);
	return blackjackGame['quotes'][randomQuotes];
}

function showCard(card, activePlayer) {
	if (activePlayer['score'] <= 21) {
		let cardImage = document.createElement('img');
		cardImage.src = `cards/${card}.png`;
		document.querySelector(activePlayer['div']).appendChild(cardImage);
		hitSound.play();		
	}
}

function updateScore(card, activePlayer) {
	if (card === 'A') {
		if (activePlayer['score'] + blackjackGame['cardsMap'][card][1] <= 21) {
			activePlayer['score'] += blackjackGame['cardsMap'][card][1];
		}
		else {
			activePlayer['score'] += blackjackGame['cardsMap'][card][0];
		}
	}

	else {
		activePlayer['score'] += blackjackGame['cardsMap'][card];
	}
}

function showScore(activePlayer) {
	if (activePlayer['score'] > 21) {
		document.querySelector(activePlayer['scoreSpan']).textContent = 'BUST!';
		document.querySelector(activePlayer['scoreSpan']).style.color = 'darkred';
	}
	else {
		document.querySelector(activePlayer['scoreSpan']).textContent = activePlayer['score'];
	}	
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function blackjackStand() {
	if (blackjackGame['isHit'] === true && blackjackStand.onclick === 0) {

		blackjackGame['isStand'] = true;
		blackjackStand.onclick = 1;

		while (DEALER['score'] < 16 && blackjackGame['isStand'] === true) {
			let card = randomCard();
			console.log(card);
			showCard(card, DEALER);
			updateScore(card, DEALER);
			showScore(DEALER);
			console.log(DEALER['score']);
			await sleep(1000);
		}

		blackjackGame['turnsOver'] = true;
		blackjackGame['notHit'] = true;
		let winner = computeWinner();
		showResult(winner);
	}

}

function blackjackDeal() {
	let quote = gameQuotes();
	if (blackjackGame['turnsOver'] === true) {

		blackjackGame['isStand'] = false;

		let yourImages = document.querySelector('#playerSide').querySelectorAll('img');
		let dealerImages = document.querySelector('#dealerSide').querySelectorAll('img');

		for (i = 0; i < yourImages.length; i++) {
			yourImages[i].remove();
		}

		for (i = 0; i < dealerImages.length; i++) {
			dealerImages[i].remove();
		}

		YOU['score'] = 0;
		DEALER['score'] = 0;

		document.querySelector('#yourScore').textContent = 0;
		document.querySelector('#dealerScore').textContent = 0;

		document.querySelector('#yourScore').style.color = '#000';
		document.querySelector('#dealerScore').style.color = '#000';

		document.querySelector('#gameOn').textContent = quote;
		document.querySelector('#gameOn').style.color = '#000';

		blackjackGame['turnsOver'] = false;
		blackjackGame['isHit'] = false;
		blackjackGame['notHit'] = false;
	}
}

function computeWinner() {
	let winner;

	if (YOU['score'] <= 21) {

		if (YOU['score'] > DEALER['score'] || DEALER['score'] > 21) {
			console.log('You won!!');
			blackjackGame['wins']++;
			winner = YOU;
		}
		else if (YOU['score'] < DEALER['score']) {
			console.log('You lost.');
			blackjackGame['losses']++;
			winner = DEALER;
		}
		else if (YOU['score'] === DEALER['score']) {
			console.log('It is a tie');
			blackjackGame['draws']++;
			winner = null;
		}
	}

	else if (YOU['score'] > 21 && DEALER['score'] <= 21) {
		console.log('You lost.');
		blackjackGame['losses']++;
		winner = DEALER;
	}

	else if (YOU['score'] > 21 && DEALER['score'] > 21) {
		console.log('It is a tie');
		blackjackGame['draws']++;
		winner = null;
	}

	console.log('Winner is ', winner);
	console.log(blackjackGame);
	return winner;
}

function showResult(winner) {
	let message, messageColor;

	if (blackjackGame['turnsOver'] === true) {
		if (winner === YOU) {
			document.querySelector('#wins').textContent = blackjackGame['wins'];
			message ='You won!!🔥';
			messageColor ='darkgreen';
			winSound.play();
		}
		else if (winner === DEALER) {
			document.querySelector('#losses').textContent = blackjackGame['losses'];
			message = 'You lost.😈';
			messageColor = 'darkred';
			lossSound.play();
		}
		else {
			document.querySelector('#draws').textContent = blackjackGame['draws'];
			message = 'It is a tie.🤝🏾';
			messageColor = 'darkblue';
		}

		document.querySelector('#gameOn').textContent = message;
		document.querySelector('#gameOn').style.color = messageColor;
	}
}
