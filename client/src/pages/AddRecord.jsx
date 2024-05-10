import React, { useState } from 'react';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { Form } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddRecord = () => {
  const [patientId, setPatientId] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const startRecording = async () => {
    try {
      toast.success('Recording started...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = handleDataAvailable;
      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success('Recording stopped...');
      // Call downloadRecording here to automatically trigger the download
      downloadRecording();
    }
  };

  const handleDataAvailable = (event) => {
    setAudioChunks((prevChunks) => [...prevChunks, event.data]);
  };

  const downloadRecording = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'recording.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(audioUrl);
    setAudioChunks([]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Start recording when submitting patient and hospital IDs
    startRecording();
    console.log('Patient ID:', patientId);
    console.log('Hospital ID:', hospitalId);
  };

  return (
    <Wrapper>
      <Form method="post" className="form" onSubmit={handleSubmit}>
        <h4>Add Record</h4>
        <div className="form-row">
          <label htmlFor="patientId" className="form-label">
            Patient ID:
          </label>
          <input
            type="text"
            id="patientId"
            name="patientId"
            className="form-input"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="hospitalId" className="form-label">
            Hospital ID:
          </label>
          <input
            type="text"
            id="hospitalId"
            name="hospitalId"
            className="form-input"
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-block">
          Submit
        </button>
      </Form>
      <div>
        <h4>Stop Recording and Save It</h4>
        <button
          className="btn btn-block"
          onClick={stopRecording}
          disabled={!isRecording}
        >
          Stop and Download Recording
        </button>
      </div>
    </Wrapper>
  );
};

export default AddRecord;
