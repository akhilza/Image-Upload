import axios from 'axios';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'


function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [listFile, setListFile] = useState([]);
  // const [uploadTrigger, setUploadTrigger] = useState(false); 


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/images');
        setListFile(response.data) // Access response data
        console.log("listFile.....", response.data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData(); // Call the async function to fetch data
  }, []);
  console.log("listFile outside useEffect:", listFile); // Check listFile outside useEffect


  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      console.log("...formData...", formData)

      try {
        // Send a POST request to the API endpoint
        const response = await axios.post('http://localhost:5000/upload', formData).then(res => {
          console.log(res)
        });

        if (response.data.status === 200) {
          console.log('File uploaded successfully');
        } else {
          console.error('Failed to upload file:', response.statusText);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.log('No file selected.');
    }
  };

  return (
    <div className="App">
      <div className="container" style={{}}>
        <div className="row">
          <div className='upload-div' style={{ width: "100%", paddingTop: "10%", textAlign: "center" }}>
            <form onSubmit={handleSubmit}>
              <input type="file" id="myFile" name="filename" onChange={handleFileChange} />
              <input type="submit" value="Upload" />
            </form>
          </div>
        </div>
      </div>
        <div className="row row-img" style={{marginTop:"5%", marginRight:"5px !important"}}>
          {listFile && listFile.length > 0 ? (
            listFile.map((item, index) => (
              <div key={index} className='col-3 m-0 p-0 col-img'>
                <img src={item.imageUrl} alt={item.alt} srcSet={item.srcSet} />
                <h4 style={{ textAlign: "center" }}>{item.filename.split('.')[0]}</h4>
              </div>
            ))
          ) : (
            <p>No files available</p>
          )}
        </div>
    </div>
  );
}

export default App;
