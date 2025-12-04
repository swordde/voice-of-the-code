import { useState, useEffect } from 'react'
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import Dashboard from './components/Dashboard';
import InterviewSession from './components/InterviewSession';
import ReportView from './components/ReportView';
import HistoryView from './components/HistoryView';
import LearningSpace from './components/LearningSpace';
import PracticeHub from './components/PracticeHub';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css'

function App() {
  const [view, setView] = useState('dashboard');
  const [interviewType, setInterviewType] = useState(null);
  const [interviewDifficulty, setInterviewDifficulty] = useState('medium');
  const [practiceTopic, setPracticeTopic] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    if (token) {
      setView('dashboard');
    } else {
      setView('auth');
    }
  }, [token]);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setView('auth');
  };

  const handleStartInterview = (type, difficulty = 'medium') => {
    setInterviewType(type);
    setInterviewDifficulty(difficulty);
    setPracticeTopic(null); // Reset practice topic
    setView('interview');
    console.log(`Starting ${type} interview with difficulty ${difficulty}...`);
  };

  const handleStartPractice = (topic) => {
    setInterviewType('technical'); // Practice is always technical/code based
    setInterviewDifficulty('medium'); // Default difficulty for practice
    setPracticeTopic(topic);
    setView('interview');
    console.log(`Starting practice session for ${topic}...`);
  };

  const handleEndSession = (report) => {
    setReportData(report);
    setView('report');
  };

  if (!token) {
    return (
      <>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand href="#home">InterviewFlow AI</Navbar.Brand>
          </Container>
        </Navbar>
        {authView === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />
        ) : (
          <Signup onLogin={handleLogin} onSwitchToLogin={() => setAuthView('login')} />
        )}
      </>
    );
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home" onClick={() => setView('dashboard')} style={{cursor: 'pointer'}}>InterviewFlow AI</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => setView('dashboard')}>Dashboard</Nav.Link>
              <Nav.Link onClick={() => setView('practice')}>Practice</Nav.Link>
              <Nav.Link onClick={() => setView('history')}>History</Nav.Link>
              <Nav.Link onClick={() => setView('learning')}>Learning</Nav.Link>
            </Nav>
            <Nav>
              <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container className="mt-4">
        {view === 'dashboard' && <Dashboard onStartInterview={handleStartInterview} />}
        {view === 'practice' && <PracticeHub onStartPractice={handleStartPractice} />}
        {view === 'interview' && <InterviewSession type={interviewType} difficulty={interviewDifficulty} topic={practiceTopic} onEndSession={handleEndSession} />}
        {view === 'report' && <ReportView report={reportData} onBack={() => setView('dashboard')} />}
        {view === 'history' && <HistoryView onBack={() => setView('dashboard')} />}
        {view === 'learning' && <LearningSpace onBack={() => setView('dashboard')} />}
      </Container>
    </>
  )
}

export default App
