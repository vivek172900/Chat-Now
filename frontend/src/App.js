import './App.css';
import Dashboard_main from './pages/Dashboard';
import Maincompo from './pages/Signup';
import { BrowserRouter as Router, Route, Routes, } from 'react-router-dom';
import Home_main from './components2/Home.jsx/Home_main';
import Practice from './components2/Practice';
import Login from './pages/Login';
import { useState } from 'react';
import SetupUserId from './components/setUp-UserId/setup-user-id.jsx';
import RequireUserId from './components/auth/RequireUserId';

function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home_main />}></Route>
        <Route path='/chat' element={<RequireUserId><Dashboard_main /></RequireUserId>}></Route>
        <Route path='/signup' element={<Maincompo />}> </Route>
        <Route path='/login' element={<Login />}> </Route>
        <Route path="/setup-user-id" element={<SetupUserId />} />
        <Route path='/practice' element={<Practice />}> </Route>
      </Routes>
    </Router>
  );
}

export default App;
