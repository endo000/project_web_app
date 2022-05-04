import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './components/Index'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" exact element={<Index />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
