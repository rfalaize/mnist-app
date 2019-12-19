import React, { Component } from "react";
import "./App.css";

/*
    Mnist application
    Draw hand-written digits on a canvas and send it to backend server for classification.
*/
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.context = null; // canvas context
        this.canvasRef = React.createRef();
        this.canvas = null;
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        this.paint = false;
        // canvas size
        this.canvasWidth = 128;
        this.canvasHeigth = 128;
    }

    componentDidMount() {
        this.context = this.canvasRef.current.getContext("2d");
        this.canvas = this.canvasRef.current;
        this.clearCanvas();
    }

    // canvas events
    canvasOnMouseDown = e => {
        this.paint = true;
        this.addClick(e.pageX - this.canvas.offsetLeft, e.pageY - this.canvas.offsetTop);
        this.redraw();
    };

    canvasOnMouseMove = e => {
        if (this.paint) {
            this.addClick(e.pageX - this.canvas.offsetLeft, e.pageY - this.canvas.offsetTop, true);
            this.redraw();
        }
    };

    canvasOnMouseUp = e => {
        this.paint = false;
    };

    canvasOnMouseLeave = e => {
        this.paint = false;
    };

    addClick(x, y, dragging) {
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickDrag.push(dragging);
    }

    redraw() {
        const { context, clickX, clickY, clickDrag } = this;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // clears the canvas
        context.strokeStyle = "#fff";
        context.lineJoin = "round";
        context.lineWidth = 10;
        for (var i = 0; i < clickX.length; i++) {
            context.beginPath();
            if (clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {
                context.moveTo(clickX[i] - 1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }
    }

    // image processing
    greyscale = data => {
        /*
            The canvas' Uint8ClampedArray is a 1D array containing the data in the RGBA order, 
            with integer values between 0 and 255 (included).
            The data property returns a Uint8ClampedArray which can be accessed to look at 
            the raw pixel data; each pixel is represented by four one-byte values 
            (red, green, blue, and alpha, in that order; that is, "RGBA" format). 
            Each color component is represented by an integer between 0 and 255. 
            Each component is assigned a consecutive index within the array, 
            with the top left pixel's red component being at index 0 within the array. 
            Pixels then proceed from left to right, then downward, throughout the array. 
            -- source: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
        */
        const greyScaleData = [];
        for (var i = 0; i < data.length; i += 4) {
            // take the avg value of R, G, B and ignore alpha
            var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            greyScaleData.push(avg);
        }
        console.log("greyScaleData generated", greyScaleData);
        return greyScaleData;
    };

    // triggers
    clearCanvas = () => {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        this.paint = false;
    };

    predict = () => {
        console.log("predict");
        const { context } = this;
        const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
        const greyScaleImage = this.greyscale([...imageData]);
        // create post request
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:5000/api/v1/mnist/predict", true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                alert(xhr.responseText);
            }
        };
        xhr.send(
            JSON.stringify({ type: "digit-recognition", image: greyScaleImage, canvasWidth: this.canvasWidth, canvasHeigth: this.canvasHeigth })
        );
    };

    render() {
        return (
            <div className="App">
                <h1>Paint</h1>
                <button className="button-red" onClick={this.clearCanvas}>
                    Clear
                </button>
                <button className="button-green" onClick={this.predict}>
                    Predict
                </button>
                <canvas
                    ref={this.canvasRef}
                    id="digitsCanvas"
                    width={this.canvasWidth}
                    height={this.canvasHeigth}
                    onMouseDown={this.canvasOnMouseDown}
                    onMouseMove={this.canvasOnMouseMove}
                    onMouseLeave={this.canvasOnMouseLeave}
                    onMouseUp={this.canvasOnMouseUp}
                ></canvas>
            </div>
        );
    }
}

export default App;
