import "./App.css";
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import AboutPage from 'src/pages/AboutPage/AboutPage'
import ViewReviewsPage from 'src/pages/ViewReviewsPage/ViewReviewsPage'
import LandingPage from 'src/pages/LandingPage/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/home" element={<><div>Replace me </div></>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
