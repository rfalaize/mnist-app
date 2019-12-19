# %% hand written digits recognition

print("*******************************************************")
print(">>> Start train.py...")

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf

print("Loading mnist dataset...")
(X_train, y_train), (X_test, y_test) = tf.keras.datasets.mnist.load_data()
X_train, X_test = X_train / 255.0, X_test / 255.
# add a channels dimension
X_train = X_train[..., tf.newaxis]
X_test = X_test[..., tf.newaxis]
print('Data loaded. X_train shape:', X_train.shape)
print(X_train.shape[0], 'train samples')
print(X_test.shape[0], 'test samples')
print("Done.")

#%% train

import os
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Flatten, Conv2D, MaxPooling2D
from datetime import datetime

# convert class vectors to binary class matrices
num_classes = 10
y_train = tf.keras.utils.to_categorical(y_train, num_classes)
y_test = tf.keras.utils.to_categorical(y_test, num_classes)

# create model
model = Sequential()
model.add(Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(28, 28, 1)))
model.add(Conv2D(64, (3, 3), activation='relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Dropout(0.25))
model.add(Flatten())
model.add(Dense(128, activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(num_classes, activation='softmax'))

# choose a loss function and an optimizer
model.compile(loss=tf.keras.losses.categorical_crossentropy,
              optimizer=tf.keras.optimizers.Adam(),
              metrics=['accuracy'])

# (optional) configure tensorboard to collect training stats
log_dir = "C:\\temp\\tensorboard\\{}".format(datetime.now().strftime("%Y%m%d-%H%M%S"))
os.mkdir(log_dir)
tensorboardCallback = tf.keras.callbacks.TensorBoard(log_dir=log_dir)

# start training
print("Start training model...")
model.fit(X_train, y_train,
          batch_size=512,
          epochs=10,
          verbose=1,
          validation_data=(X_test, y_test),
          callbacks=[tensorboardCallback])

# evaluate the trained model
print("Model trained. Evaluating on test set...")
score = model.evaluate(X_test, y_test, verbose=0)
print('Test loss:', score[0])
print('Test accuracy:', score[1])

#%% save model
save_path = "C:\TEMP\mnist_model.h5"
model.save(save_path)
print("Model saved on disk:", save_path)

#%% visualization

def predictAndPlotImage():
    num = 17
    plt.imshow(X_train[num])
    plt.show()
    prediction = np.argmax(predictions[num])
    print("Neural net predicts:\t", prediction)
    print("Correct value:      \t", y_test[num])
    print("===== CORRECT ===== ") if (prediction == y_test[num]) else print("===== WRONG =====")
    #bars = plt.bar(digits.target_names, predictions[num])
    #bars[prediction].set_color('r')
    #plt.show()

#%%
print(">>> END")
print("*******************************************************")
