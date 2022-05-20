import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MyNavbar from "./components/Navbar";
import Index from './components/Index'
import UserHistory from './components/UserHistory'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <MyNavbar />
        <Routes>
          <Route path="/" exact element={<Index />}></Route>
          <Route path="/users/history" exact element={<UserHistory />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
