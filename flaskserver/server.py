import subprocess, os
from flask import Flask, request
from werkzeug.utils import secure_filename
from flask import Flask, Response, request, jsonify
import io
from io import BytesIO
import base64
from flask_cors import CORS, cross_origin
from PIL import Image
import sys
import json


app = Flask(__name__)
CORS(app, resources={r'/*': {'origins': '*'}})
app.config['UPLOAD_DIRECTORY'] = 'uploads'

@app.route("/uploads", methods=['POST'])
def process():
     if request.method == 'POST':

        try:
            # Extract the base64 data from the request body
            image = request.files['image']
            image.save('uploads/image.png')
            print("Image saved in /uploads\n\n")
            res = subprocess.check_output([sys.executable, "script.py"])

            print("Image successfully processed")
            output_string = res.decode('utf-8')
            json_data = json.loads(output_string) 
            
            return json_data

        except Exception as e:
            return jsonify({'error': str(e)}), 500
                # image = Image.open(io.BytesIO(image_data))
            # file = request.files['file']
            # if file:
            #     file.save(os.path.join(
            #         app.config['UPLOAD_DIRECTORY'],
            #         secure_filename(file.filename)
            #     ))
            # subprocess.run(["python", "script.py"])
        # 192.168.29.170

        return status



if __name__ == '__main__':
    app.run(host='192.168.8.106', port=5000, debug=True, )