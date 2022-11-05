import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Group from './pages/Group'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Home />} />
        <Route exact path='/group/:id' element={<Group />} />
      </Routes>
    </Router>
  )
}

export default App
