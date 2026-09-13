import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Quote Form</div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<div>Setup</div>} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div>Dashboard</div>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App