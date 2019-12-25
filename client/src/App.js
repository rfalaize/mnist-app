import React, { Component } from "react";
import Chart from "chart.js";
import "./App.css";

/*
    Mnist application
    Draw hand-written digits on a canvas and send it to backend server for classification.
*/
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.canvasRef = React.createRef();
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        this.paint = false;
        // canvas size
        this.canvasWidth = 128;
        this.canvasHeigth = 128;
        // chart
        this.chartRef = React.createRef();
        this.state.chartProbabilities = [];
        this.state.chartPrediction = -1;
    }

    componentDidMount() {
        // chart canvas
        this.createChart();
        // clear
        this.clearAll();
    }

    componentDidUpdate() {
        this.createChart();
    }

    createChart = () => {
        const probasChartRef = this.chartRef.current.getContext("2d");
        const backgroundColors = Array.from({ length: 10 }, () => "orange");
        // if (this.state.chartPrediction > 0) {
        //     backgroundColors[this.state.chartPrediction] = "#f89406";
        // }
        new Chart(probasChartRef, {
            type: "bar",
            data: {
                labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                datasets: [
                    {
                        backgroundColor: backgroundColors,
                        data: this.state.chartProbabilities
                    }
                ]
            },
            options: {
                responsive: true,
                legend: {
                    position: "top",
                    display: false
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                fontColor: "#fff"
                            }
                        }
                    ],
                    yAxes: [
                        {
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                fontColor: "#fff",
                                max: 1,
                                min: 0,
                                stepSize: 0.5
                            }
                        }
                    ]
                },
                title: {
                    display: false,
                    text: "Probabilities",
                    fontColor: "#fff"
                }
            }
        });
    };

    // canvas events
    canvasOnMouseDown = e => {
        this.paint = true;
        const drawingCanvas = this.canvasRef.current;
        this.addClick(e.pageX - drawingCanvas.offsetLeft, e.pageY - drawingCanvas.offsetTop);
        this.redraw();
    };

    canvasOnMouseMove = e => {
        if (this.paint) {
            const drawingCanvas = this.canvasRef.current;
            this.addClick(e.pageX - drawingCanvas.offsetLeft, e.pageY - drawingCanvas.offsetTop, true);
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
        const context = this.canvasRef.current.getContext("2d");
        const { clickX, clickY, clickDrag } = this;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // clears the canvas
        context.strokeStyle = "#fff";
        context.lineJoin = "round";
        context.lineWidth = 8;
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
        return greyScaleData;
    };

    // triggers

    clearAll = () => {
        this.clearCanvas();
        this.clearResults();
    };

    clearCanvas = () => {
        const context = this.canvasRef.current.getContext("2d");
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        this.paint = false;
    };

    clearResults = () => {
        this.setState({ chartProbabilities: [], chartPrediction: -1 });
    };

    predict = () => {
        console.log("predict");
        const context = this.canvasRef.current.getContext("2d");
        const appComponent = this;
        const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
        const greyScaleImage = this.greyscale([...imageData]);
        // create post request
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:5000/api/v1/digits/predict", true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.onreadystatechange = function() {
            appComponent.clearResults();
            if (xhr.readyState === XMLHttpRequest.DONE) {
                const result = JSON.parse(xhr.responseText);
                if (!result.success) {
                    alert(xhr.responseText);
                } else {
                    appComponent.setState({ chartProbabilities: result.probas, chartPrediction: result.digit });
                }
            }
        };
        xhr.send(JSON.stringify({ image: greyScaleImage, imageWidth: this.canvasWidth, imageHeigth: this.canvasHeigth }));
    };

    render() {
        return (
            <div className="flex-container">
                <div className="flex-container-item">
                    <h1>Draw digit</h1>
                </div>

                <div className="flex-container-item">
                    <canvas
                        className="drawing-canvas"
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

                <div className="flex-container-item">
                    <button className="button-green" onClick={this.predict}>
                        Classify
                    </button>
                </div>

                <div className="flex-container-item">
                    <button className="button-blue" onClick={this.clearAll} style={{ marginBottom: "30px" }}>
                        Clear
                    </button>
                </div>

                <div className="flex-container-item">
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">
                                <h2>Result</h2>
                                <p style={{ marginBottom: "25px" }}>Digit recognized:</p>
                                <span className="predicted-digit">{this.state.chartPrediction >= 0 ? this.state.chartPrediction : null}</span>
                            </div>
                            <div className="flip-card-back">
                                <h2>Model Probabilities</h2>
                                <canvas id="chartCanvas" ref={this.chartRef} height="150" width="400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
