# rest api to serve the model

import flask
from flask_cors import CORS
from flask_restplus import Api, Resource, fields
import tensorflow as tf
from skimage.transform import resize
# import matplotlib.pyplot as plt
import numpy as np

# disable GPU usage for inference
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

app = flask.Flask(__name__)
CORS(app)
app.config["DEBUG"] = False
api = Api(app,
          version='1.0',
          title='Digits Recognition API',
          description='An API to recognize hand written digits.'
)
ns = api.namespace('api/v1/digits', description='Digit recognition operations')

# create API schema
preditionRequest = api.model('PreditionRequest', {
    'image': fields.List(fields.Integer, required=True, description='1D flattened array of grey-scaled pixel values, between 0 and 255'),
    'imageWidth': fields.Integer(required=True, description='image width, in pixels'),
    'imageHeigth': fields.Integer(required=True, description='image heigth, in pixels')
})
preditionResponse = api.model('PreditionResponse', {
    'success': fields.Boolean,
    'digit': fields.Integer(description='the predicted digit, between 0 and 9'),
    'probas': fields.List(fields.Float, description='array of probabilities for each digit, between 0 and 1')
})

# load trained model
print("Loading model...")
model = tf.keras.models.load_model("C:\TEMP\mnist_model.h5")
print("Model loaded. Starting server...")

@ns.route('/health-check', methods=['GET'])
class HealthCheck(Resource):
    def get(self):
        # return default HTTP code 200
        return

@ns.route('/predict', methods=['POST'])
class DigitRecognizer(Resource):

    @ns.expect(preditionRequest)
    @ns.marshal_with(preditionResponse, code=201)
    def post(self):
        try:
            print("**************** NEW REQUEST RECEIVED ****************")
            req = api.payload
            image = np.reshape(np.array(req['image']), (128, 128))
            image = resize(image, (28, 28), anti_aliasing=True, preserve_range=True)
            image = image / 255.0
            # plt.imshow(image)
            image = np.reshape(image, (1, 28, 28, 1))
            print('Running predictions on image with size', image.shape)
            probabilities = model.predict(image)
            digit = np.argmax(probabilities)
            result = {'success': True, 'digit': int(digit), 'probas': probabilities[0].tolist()}
        except Exception as e:
            result = {'status': False, 'error': str(e)}
        print('>>> result:', result)
        return result, 201


if __name__ == '__main__':
    app.run()