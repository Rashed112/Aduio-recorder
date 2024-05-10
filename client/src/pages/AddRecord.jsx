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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = handleDataAvailable;
      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
      toast.success('Recording started...');
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
    link.download = `${patientId}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Cleanup
    URL.revokeObjectURL(audioUrl);
    setAudioChunks([]);
  };

  const sendAudioToServer = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audioFile', audioBlob, `${patientId}.wav`);
    formData.append('patientId', patientId);
    formData.append('hospitalId', hospitalId);

    try {
      const response = await fetch(
        `https://3016-103-197-153-48.ngrok-free.app/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();
      toast.success('Audio file sent successfully!');
      console.log(result);
    } catch (error) {
      console.error('Failed to send audio:', error);
      toast.error('Failed to send audio.');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    startRecording();
  };

  return (
    <Wrapper>
      <Form method="post" className="form" onSubmit={handleSubmit}>
        <h4>Add Record</h4>
        <br />
        <br />
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
        <br />

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
        <br />
        <br />
        <button type="submit" className="btn btn-block">
          Start Recording
        </button>
        <br />
        <br />
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="btn btn-block"
        >
          Stop Recording and Download
        </button>
        <br />
        <br />
        <button
          onClick={sendAudioToServer}
          disabled={audioChunks.length === 0}
          className="btn btn-block"
        >
          Send Audio to Server
        </button>
      </Form>
    </Wrapper>
  );
};

export default AddRecord;
