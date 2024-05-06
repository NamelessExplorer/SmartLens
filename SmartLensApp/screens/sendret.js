import axios from 'axios';

const sendImageToPython = async (imageUrl) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUrl,
    type: 'image/jpeg', // Adjust based on image type
    name: 'image.jpg', // Optional filename
  });

  try {
    const response = await axios.post('http://your_python_script_url:port/image_upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Response from Python script:', response.data); // This should contain the extracted text
  } catch (error) {
    console.error('Error sending image:', error);
  }
};