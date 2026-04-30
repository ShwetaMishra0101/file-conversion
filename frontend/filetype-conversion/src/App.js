import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Component/Common/Layout';
import MediaLibrary from './Pages/MediaLibrary';
import Feedback from './Pages/Feedback';
import AutoFormFill from './Pages/AutoFormFill';
import ResumeReview from './Pages/ResumeReview';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MediaLibrary />} />
          <Route path="/auto-form-fill" element={<AutoFormFill />} />
          <Route path="/resume-review" element={<ResumeReview />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
