/**

Developped by Minozar; 

**/

var img = new Image();
img.src = "/static/img/cat.jpg";

// Variables

var WIDTH = 0;
var HEIGHT = 0;

var ORIGINAL_CTX = null;
var TARGET_CTX = null;
var PROCESSING_CTX = null;

var ORIGINAL_IMAGE_DATA_PIXELS = null;
var NB_PIXELS = null;

var NB_LINES = 250;
var NB_GENES = 3;

var NB_EPOCHS = 10000;
var POPULATION_LENGTH = 50;
var HIGH_TOP = 30;
var CROSSING_OVER_TOP = 20;
var POPULATION = [];
var MUTATION_RATE = 0.05;

// Canvas

var targetCanvas = $('#targetCanvas')[0];
if (targetCanvas.getContext){
	TARGET_CTX = targetCanvas.getContext('2d'); 
}

var originalCanvas = $('#originalCanvas')[0];
if (originalCanvas.getContext){
	ORIGINAL_CTX = originalCanvas.getContext('2d'); 
	WIDTH = originalCanvas.width;
	HEIGHT = originalCanvas.height;

	PROCESSING_CTX = createContext(WIDTH, HEIGHT); 

	img.onload = function () {
		ORIGINAL_CTX.drawImage(img, 0 , 0);
		original_image_data = ORIGINAL_CTX.getImageData(0, 0, WIDTH, HEIGHT);
		ORIGINAL_IMAGE_DATA_PIXELS = original_image_data.data;
		NB_PIXELS = ORIGINAL_IMAGE_DATA_PIXELS.length;
		startDrawing();
	}
}

//

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function createContext(width, height) {
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	return canvas.getContext("2d");
}

// Canvas functions

function drawLine (ctx, line){
	var x1 = line['shape']['x1'];
	var y1 = line['shape']['y1'];
	var x2 = line['shape']['x2'];
	var y2 = line['shape']['y2'];
	var color = line['color'];
	var thickness = line['thickness'];

	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineWidth = thickness;
	var color = 'rgba(' + line['color'][0] + ',' + line['color'][1] + ',' + line['color'][2] + ',' + line['color'][3] + ')';
	ctx.strokeStyle = color;
	ctx.stroke();
}

function clearCanvas(ctx){
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function createLine(shape, color, thickness){
	infoLine = {"shape" : shape, "color" : color, "thickness" : thickness}
	return infoLine
}

function createRandomImage(){
	randomImg = [];
	for (var i = 0; i < NB_LINES; i++) {
		x1 = getRandomInt(WIDTH);
		y1 = getRandomInt(HEIGHT);
		x2 = getRandomInt(WIDTH);
		y2 = getRandomInt(HEIGHT);
		shape = {"x1" : x1, "y1" : y1, "x2" : WIDTH - x2, "y2" : HEIGHT - y2};
		color = [getRandomInt(255), getRandomInt(255), getRandomInt(255), Math.random()];
		thickness = getRandomInt(5);
		randomImg.push(createLine(shape, color, thickness));
	}
	return randomImg;
}

function displayImg(ctx, imgGene){
	clearCanvas(ctx)
	for (var i = 0; i < imgGene.length; i++) {
		drawLine(ctx, imgGene[i]);
	}
}

function createPopulation(){
	var population = [];
	for (var i = 0; i < POPULATION_LENGTH; i++) {
		population.push([createRandomImage(), Infinity]);
	}
	return population;
}

// Genetic algorithm

function getCost(imgGene){
	displayImg(PROCESSING_CTX, imgGene);
	var imageData = PROCESSING_CTX.getImageData(0, 0, WIDTH, HEIGHT);
	var pixels = imageData.data;

	var cost = 0;
	for (var i = 0; i < NB_PIXELS; i+=4) {
		diff = Math.abs(pixels[i] - ORIGINAL_IMAGE_DATA_PIXELS[i]);
		cost += diff;
	}

	return cost;
}

/*function getCost(imgGene){
	displayImg(PROCESSING_CTX, imgGene);
	var imageData = PROCESSING_CTX.getImageData(0, 0, WIDTH, HEIGHT);
	var pixels = imageData.data;

	var score = 0;
	for (var i = 0; i < pixels.length; i++) {
		if(i % 20 == 0){
			diff = Math.abs(pixels[i] - ORIGINAL_IMAGE_DATA_PIXELS[i]);
			score += diff;
		}
	}

	return score;

	var score = 0;
	var nbPixels = ORIGINAL_IMAGE_DATA_PIXELS.length;
	console.log(nbPixels);
	for (var i = 0; i < nbPixels; i++) {
		console.log(i);
		if(i % 20 == 0){
			displayImg(PROCESSING_CTX, imgGene);
			var imageData = PROCESSING_CTX.getImageData(0, 0, WIDTH, HEIGHT);
			var pixels = imageData.data;
			diff = Math.abs(pixels[i] - ORIGINAL_IMAGE_DATA_PIXELS[i]);
			score += diff;
		}
	}

	return score;
}*/

function evaluation(){
	for (var i = 0; i < POPULATION_LENGTH; i++) {
		score = getCost(POPULATION[i][0]);
		POPULATION[i][1] = score;
	}

	POPULATION.sort(function(a, b){
		if (a[1] > b[1]) return 1;
		if (a[1] < b[1]) return -1;
		return 0;
	});
}

function selection(){
	POPULATION = POPULATION.slice(0, HIGH_TOP);
}

function mutations(){
	for (var i = 0; i < POPULATION.length; i++) {
		for (var j = 0; j < NB_LINES; j++) {
			p = Math.random();
			if (p < MUTATION_RATE){
				var indexLine = getRandomInt(NB_LINES);
				indexLine = j;
				var indexGene = getRandomInt(NB_GENES); 

				var indiv = JSON.parse(JSON.stringify(POPULATION[i][0]));
				var scoreBefore = JSON.parse(JSON.stringify(POPULATION[i][1]));

				if (indexGene == 0){
					x1 = getRandomInt(WIDTH);
					y1 = getRandomInt(HEIGHT);
					x2 = getRandomInt(WIDTH);
					y2 = getRandomInt(HEIGHT);
					shape = {"x1" : x1, "y1" : y1, "x2" : WIDTH - x2, "y2" : HEIGHT - y2};
					indiv[indexLine]["shape"] = shape;
				}
				else if (indexGene == 1){
					color = [getRandomInt(255), getRandomInt(255), getRandomInt(255), Math.random()];
					indiv[indexLine]["color"] = color;
				}
				else if (indexGene == 2){
					thickness = getRandomInt(5);
					indiv[indexLine]["thickness"] = thickness;
				}
				else {
					console.log('Error : mutations');
				}

				/*var scoreAfter = getCost(indiv);
				if (scoreAfter <= scoreBefore){
					POPULATION[i][0] = indiv;
				}*/	
				POPULATION[i][0] = indiv;
			}
		}
	}
}

function crossOver(){
	indiv1 = JSON.parse(JSON.stringify(POPULATION[0][0]));

	for (var i = 1; i < CROSSING_OVER_TOP; i++) {
		indiv2 = JSON.parse(JSON.stringify(POPULATION[i][0]));
		index = getRandomInt(NB_LINES);
		child1 = indiv1.slice(0, index).concat(indiv2.slice(index));
		child2 = indiv2.slice(0, index).concat(indiv1.slice(index));
		POPULATION.push([child1, Infinity]);
		POPULATION.push([child2, Infinity]);
	}
}

function completePopulation(){
	for (var i = POPULATION.length; i < POPULATION_LENGTH; i++) {
		POPULATION.push([createRandomImage(), Infinity]);
	}
}

var count = 0;
function run(){
	if(count <= NB_EPOCHS){
		evaluation();
		selection();
		if (count % 5 == 0) {
			displayImg(TARGET_CTX, POPULATION[0][0]);
			console.log('Epoch : ' + count + ' - Cost : ' + POPULATION[0][1]);
		}
		crossOver();
		mutations();
		completePopulation();
		window.requestAnimationFrame(run);
		count++;
	}
}

function startDrawing(){
	POPULATION = createPopulation();
	displayImg(TARGET_CTX, POPULATION[0][0]);
	window.requestAnimationFrame(run);
}

