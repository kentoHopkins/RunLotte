import { useState } from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Landing from './components/Landing';
import './App.css';
import Map from './components/Adithya-Page/Map';

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

