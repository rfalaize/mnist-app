# rest api to serve the model

import flask
from flask_cors import CORS
from flask import request
import tensorflow as tf
from skimage.transform import resize
import matplotlib.pyplot as plt
import numpy as np
import json

# disable GPU usage for inference
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

app = flask.Flask(__name__)
CORS(app)
app.config["DEBUG"] = True

# load model
print("*****************************************")
print("Loading model...")
model = tf.keras.models.load_model("C:\TEMP\mnist_model.h5")
print("Model loaded. Starting server...")

@app.route('/', methods=['GET'])
def home():
    return "<h1>Hand writtent digit recognition</h1>"

@app.route('/api/v1/mnist/predict', methods=['POST'])
def predict():
    try:
        print("**************** NEW REQUEST RECEIVED ****************")
        req = json.loads(request.data)
        image = np.reshape(np.array(req['image']), (128, 128))
        image = resize(image, (28, 28), anti_aliasing=True, preserve_range=True)
        image = image / 255.0
        plt.imshow(image)
        image = np.reshape(image, (1, 28, 28, 1))
        print('Running predictions on image with size', image.shape)
        probabilities = model.predict(image)
        digit = np.argmax(probabilities)
        result = str({'status': 'ok', 'digit': digit, 'probas': probabilities})
    except Exception as e:
        result = str({'status': 'ko', 'error': str(e)})
    print('>>> result:', result)
    return result

app.run()