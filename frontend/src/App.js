import './App.css';
import Dashboard_main from './pages/Dashboard';
import Maincompo from './pages/Signup';
import { BrowserRouter as Router, Route, Routes, } from 'react-router-dom';
import Home_main from './components2/Home.jsx/Home_main';
import Practice from './components2/Practice';
import Login from './pages/Login';
import { useState } from 'react';
import DebugAuth from './pages/DebugAuth';

function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home_main />}></Route>
        <Route path='/chat' element={<Dashboard_main />}></Route>
        <Route path='/signup' element={<Maincompo />}> </Route>
        <Route path="/debug-auth" element={<DebugAuth />} />
        <Route path='/login' element={<Login />}> </Route>
        <Route path='/practice' element={<Practice />}> </Route>
      </Routes>
    </Router>
  );
}

export default App;
