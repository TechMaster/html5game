class FreeHand {
  constructor(canvas) {
    this.canvas = canvas
    this.context = canvas.getContext("2d");

    this.isDraw = false;
    this.points = [];

    this.context.lineWidth = 5;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.strokeStyle = 'red';

    this.memCanvas = document.createElement('canvas');
    this.memCanvas.width = canvas.width;
    this.memCanvas.height = canvas.height;
    this.memCtx = this.memCanvas.getContext('2d');
  }

  onmousedown(event) {
    this.x = event.offsetX;
    this.y = event.offsetY;

    this.points.push({
      x: this.x,
      y: this.y
    });

    this.isDraw = true;
    this.context.strokeStyle = rgb();
  }

  onmousemove(event) {
    if (this.isDraw) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // put back the saved content
      this.context.drawImage(this.memCanvas, 0, 0);
      this.points.push({
        x: event.offsetX,
        y: event.offsetY
      });
      this.drawPoints();
    }
  }

  onmouseup(event) {
    if (this.isDraw) {
      this.isDraw = false;
      // When the pen is done, save the resulting context
      // to the in-memory canvas
      this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.memCtx.drawImage(this.canvas, 0, 0);
      this.points = [];
    }
  }

  drawPoints() {
    let ctx = this.context;

    if (this.points.length < 6) return;

    ctx.beginPath(), ctx.moveTo(this.points[0].x, this.points[0].y);
    let i;
    for (i = 1; i < this.points.length - 2; i++) {
      var c = (this.points[i].x + this.points[i + 1].x) / 2;
      var d = (this.points[i].y + this.points[i + 1].y) / 2;
      ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, c, d);
    }
    ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
    ctx.stroke();
  }

  clearCanvas() {    
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function rgb() {
  color = 'rgb(';
  for (var i = 0; i < 3; i++) {
    color += Math.floor(Math.random() * 255) + ',';
  }
  return color.replace(/\,$/, ')');
}