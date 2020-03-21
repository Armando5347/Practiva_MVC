(function () {
    self.Board = function(width,height) {
		this.width = width;
		this.height = height;
		this.playing = false;
		this.game_over = false;
		this.bars = [];
		this.ball = null;
	}

	self.Board.prototype = {
		get elements(){
			var elements = this.bars.map(function (bar) { return bar; });
			elements.push(this.ball);
			return elements;
		}
	}
})();


(function  () {
	self.Ball = function(x,y,radius,board) {
		this.x = x;
		this.y = y
		this.radius = radius;
		this.speed_y=0;
		this.speed_x = 3;
		this.speed = 3;
		this.board = board
		this.direction = -1;
		board.ball=this;
		this.kind="circle";
		this.bounce_angle = 0;
		this.max_bounce_angle = Math.PI/12;
	}
	self.Ball.prototype = {
		move: function  () {
			this.x += this.speed_x * this.direction;
			this.y += this.speed_y;
			//console.log("X: "+ this.x + " Y: "+ this.y);
		},
		get width(){
			return this.radius * 2;
		},
		get height(){
			return this.radius *2;
		},
		collisions: function  (bar) {
			// Reacciona al la barra que resibe como parametro
			var relative_intersect_y = (bar.y + (bar.height/2) ) - this.y;
			console.log(relative_intersect_y)
			var normalized_intersect_y = relative_intersect_y / (bar.height / 2);
			console.log(normalized_intersect_y)
			console.log(this.max_bounce_angle)
			this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;
			console.log(this.bounce_angle);
			this.speed_y = this.speed * -Math.sin(this.bounce_angle);
			this. speed_x = this.speed * Math.cos(this.bounce_angle);

			if(this.x > (this.board.width/2)){
				this.direction = -1;
			}else{
				this.direction = 1;
			}

		}
	}
})();


(function  () {
	self.Bar = function(x,y,width,height,board) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.board = board;
		this.board.bars.push(this); //meterlo al arreglo de las barras
		this.kind = "rectangle" //Fomra para que lo reconozca el canvas
		this.speed = 10;
	}
		self.Bar.prototype = {

			subir: function(){
				this.y -= this.speed;
			},
			bajar: function(){
				this.y += this.speed;
			},
			toString: function () {
				return "x: "+ this.x + " y: "+ this.y
			}
		}


})();
	/*HELPER METHODS
	Metodos que no pertenecer a un objeto, pero, ayudan a relizar acciones
	*/
(function () {
	self.BoardView = function(canvas,board){
		this.canvas = canvas;
		this.canvas.width = board.width;
		this.canvas.height = board.height;
		this.board = board;
		this.ctx = canvas.getContext("2d");
	}

	self.BoardView.prototype = {

		draw: function  () {
			for (var i = this.board.elements.length - 1; i >= 0; i--) {
				var el = this.board.elements[i];
				//Vamos a recorrer los elementos para dibujarlos
				draw(this.ctx, el)
			};
		},
		play: function  () {
			if(this.board.playing){
				this.draw();
				this.check_collisions();
				this.board.ball.move();
			}	
		},
		check_collisions: function  (argument) {
			for (var i = this.board.bars.length - 1; i >= 0; i--) {
				var bar = this.board.bars[i];
				if(hit(bar, this.board.ball)){
					this.board.ball.collisions(bar);
				}
			};
		}
	}

	function hit (a,b) {
		//Revisa si A colisiona con B
		var hit = false;
		//Colisión horizontal
		
		if(b.x + b.width >= a.x && b.x < a.x + a.width){
			//Colisión vertical
			if(b.y + b.height >= a.y && b.y < a.y + a.height){
				hit = true;
			}
		}
		//Colision de a con b
		if(b.x <= a.x && b.x + b.width >= a.x + a.width){
			if(b.y <= a.y && b.y + b.height >= a.y + a.height){
				hit = true;
			}
		}
		//Colisión de b con a
		if(a.x <= b.x && a.x + a.width >= b.x + b.width){
			if(a.y <= b.y && a.y + a.height >= b.y + b.height){
				hit = true;
			}
		}
		return hit;
	}

	function draw (ctx, element) {
		// Dibuja los elementos
		switch(element.kind){
			case "rectangle":
				ctx.fillRect(element.x, element.y, element.width, element.height);
				break;
			
			case "circle":
				ctx.beginPath();
				ctx.arc(element.x, element.y, element.radius, 0, 7); //Para que sea un circulo, por algúna razón es 0 y 7
				ctx.fill();
				ctx.closePath();
				break;
			}
	}
})();

var board = new Board(800,400);
var bar_1 = new Bar(20,150,40,100,board);
var bar_2 = new Bar(740,150,40,100,board);
var ball = new Ball(380, 190, 10, board);


document.addEventListener("keydown", function  (ev) {// ev === evento
	if(ev.keyCode === 38){
		ev.preventDefault();
		bar_2.subir();
	}
	else if(ev.keyCode === 40){
		ev.preventDefault();
		bar_2.bajar();

	}else if(ev.keyCode === 87){ //w
		ev.preventDefault();
		bar_1.subir();
	}
	else if(ev.keyCode === 83){ //s
		ev.preventDefault();
		bar_1.bajar();
	}else if (ev.keyCode===32){
		board.playing = !board.playing;
	}
	
});
window.requestAnimationFrame(controller)

//self.addEventListener("load", main); Era un evento temporal para ver los cambios

function controller() {
	var canvas = document.getElementById('canvas');
	var board_view = new BoardView(canvas, board);
	board_view.draw()
	board_view.play();
	window.requestAnimationFrame(controller)
}