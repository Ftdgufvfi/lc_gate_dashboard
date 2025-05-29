import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login.js';
import Dashboard from './pages/dashboard.js';

function App() {
  return (
    <div className='App'>
      <Router>
      <Routes>
        <Route path = '/' element = {<Login />}/>
        <Route path = '/dashboard' element = {<Dashboard />} />
      </Routes>
      </Router>
    </div>
  );
}

export default App;
