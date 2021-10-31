import './App.css';
import {Row, Col, Container, Figure, Button, Spinner, Alert, Badge} from 'react-bootstrap'
import axios from 'axios';
import { useState } from 'react';

const SEQUENCES = ["t1","t2","flair","t1ce"];
const OUTPUT_SEQUENCES = ["t1","t2","flair","t1ce","segmented"];
const SERVER_URL = "3.35.4.26";

var files = {
  "t1" : null,
  "t2" : null,
  "t1ce" : null,
  "flair" : null
};

function App() {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [urls, setUrls] = useState({
    "t1": null,
    "t2" : null,
    "t1ce" : null,
    "flair" : null
  });

  return (
    <div className="App">
      <h3 style={{marginBottom:'20px'}}>
        Tumor Detector
        <sup style={{marginLeft:'10px'}}><Badge bg="danger">beta</Badge></sup>
      </h3>
      <Alert variant="warning" style={{margin:'20px 20px'}}>
        Not intended for medical use. Developed for demonstration purposes.
      </Alert>
      
      <Container fluid>
        <Row>
          {SEQUENCES.map((element) => <InputComponent key={element} label={element} handleChange={(e) => {
            files[element] = e.target.files[0];
          }} />)}
        </Row>
        <Row style={{margin:'20px 30px 50px 30px'}}>
          <Button size="lg" onClick={() => {
            if(Object.values(files).every((element) => element !== null)) {
              
              const formData = new FormData();

              for (const [key,value] of Object.entries(files)) {
                formData.append(key+"_file", value);
              }
              setLoading(true);
              setLoaded(false); // reset loaded state, so hide result images

              axios.post('http://'+SERVER_URL+'/predict',formData,{
                headers: { "Content-Type": "multipart/form-data"}
              }).then((response) => {
                console.log(response);
                setLoading(false);
                setLoaded(true); // set loaded ==true only when successful
                setUrls(response.data.paths);

              }).catch((e) => {
                alert('error');
                setLoading(false);
              }) ;
            } else {
              alert('please select files for all sequences');
            }
          }}>{!loading ? <span>Upload images and get results</span> : <span>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span style={{marginLeft:'10px'}}>Loading...</span></span>}</Button>
          
        </Row>
        {loading === false && loaded === true && <Row>
          {OUTPUT_SEQUENCES.map((element) => <OutputComponent key={element} label={element} path={urls[element]} />)}


        </Row>}
      </Container>
    </div>
  );
}

function InputComponent(props) {
  return(
    <Col 
    xs={12} md={6}>
        <div style={{margin:'10px 20px',padding:'10px 20px',backgroundColor:'#EFEFEF', borderRadius:'10px'}}>
          <div><b>{props.label}</b> image</div>
          <input type="file" onChange={props.handleChange} />
        </div>
    </Col>
  )
}


function OutputComponent(props) {
  return (
    <Col>
      <Figure>
        <Figure.Image
          width={128}
          height={128}
          alt={props.label}
          src={"http://" + SERVER_URL + "/" + props.path}
        />
        <Figure.Caption>
          {props.label}
        </Figure.Caption>
      </Figure>
    </Col>
  )
}
export default App;
