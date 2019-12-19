# Server

This is the restful python API to serve our Deep Learning model and perform predictions. 🐍<br/>
Project is composed of:

-   train.py: script to train the model
-   server.py: script to start the http server

<br/>

### Installation instructions

I recommend using Anaconda distibution, available at <a href="https://docs.anaconda.com/anaconda/install/">https://docs.anaconda.com/anaconda/install/</a>.

Once installed, run this command if you want to update conda to its latest version (you might need to run it a few times):

<code>conda update conda</code>

Then, create a virtual environment for the project.<br/>
Note: the steps below suppose you cloned the repo in D:\github\mnist-app on windows; feel free to change it:

<code>conda create --prefix "D:/github/mnist-app/server/venv" python=3.7</code>

Navigate to the server folder and activate then environment:

<code>cd D:\github\mnist-app\server</code><br/>
<code>conda activate "D:/github/mnist-app/server/venv"</code>

And install the dependencies:

<code>pip install -r requirements.txt</code>

<br/>

### Train model

Running this script will:
- load mnist dataset using keras
- train the model and save training stats under C:\temp\tensorboard\
- save the model structure and weights in a binary file (.h5), under C:\temp

<code>python train.py</code>

Note: you can visualize the training stats by starting a tensorboard server:

<code>tensorboard --logdir="C:\temp\tensorboard\"</code>

And navigate to http://localhost:6006 to see nice graphs 📈

<br/>

### Start server

Run this script to start the rest API:

<code>python server.py</code>

You can then navigate to http://localhost:5000/swagger.html and see the endpoints description provided by swagger.

<br/>

### Next steps

That's it ! 🙂 <br/>
Now that the server is started, go to the client folder at the root of the repo and compile the web UI.