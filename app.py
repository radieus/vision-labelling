#!flask/bin/python
from flask import Flask, jsonify, render_template, request, make_response
import uuid
import os
from google.cloud import storage, vision

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "main-account.json"

app = Flask(__name__, template_folder='templates')

@app.route("/")
def index():
    return render_template("login.html")

@app.route("/upload.html")
def upload():
    return render_template("upload.html")

@app.route('/add', methods=['POST'])
def addimage():
    image = request.files['file']
    image_url = upload_image_file(image)
    image_url = "gs://vision-labelling-267619-bucket/" + image_url.split('/')[4]
    imageBucketURL = str(image_url)
    res = make_response(jsonify({"imageBucketURL":imageBucketURL}), 200)

    return res

@app.route('/label', methods=['GET', 'POST'])
def printlabels():
    imageBucketURL = request.form['imageBucketURL']
    labels = detect_labels_uri(imageBucketURL)
    listlabels = []
    listscores = []
    for label in labels:
        listlabels.append(label.description)
        listscores.append(label.score)
    print(listlabels)
    print(listscores)
    res = make_response(jsonify([{'description': label, 'score': score} for label, score in zip(listlabels, listscores)]), 200)
    print(res)

    return res 

def implicit():
    storage_client = storage.Client()
    buckets = list(storage_client.list_buckets())
    print(buckets)

def upload_file(file_stream, filename, content_type):
    """
    Uploads file to the bucket and returns object's url
    """
    client = storage.Client(project='vision-labelling-267619')
    bucket = client.bucket('vision-labelling-267619-bucket')
    blob = bucket.blob(filename)
    blob.upload_from_string(file_stream, content_type=content_type)
    url = blob.public_url

    return url

def upload_image_file(file):
    """
    Upload the user-uploaded file to Google Cloud Storage and retrieve its
    publicly-accessible URL.
    """
    public_url = upload_file(file.read(), file.filename, file.content_type)

    return public_url

def detect_labels_uri(uri):
    """
    Detects labels in the file located in Google Cloud Storage or on the Web.
    """
    client = vision.ImageAnnotatorClient()
    image = vision.types.Image()
    image.source.image_uri = uri
    response = client.label_detection(image=image)
    labels = response.label_annotations

    return labels

if __name__ == '__main__':
    app.run(debug=True)