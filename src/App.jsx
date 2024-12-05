import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import Header from "./Frontend/Header Component/Header.jsx"
import SellMySite from "./Frontend/SellMySite/SellMySite.jsx"
import Profile from "./Frontend/Profile Component/Profile.jsx"
import Messages from "./Frontend/Private Messages Component/Messages.jsx"
import PublishWebsite from "./Frontend/Website Component/Publish/PublishWebsite.jsx"

function App() {
  return (
    <>
      <Router>
        <Header />

        <Routes>
          <Route path="/" element={
            <SellMySite />
          } />

          <Route path="/messages" element={
            <Messages />
          } />

          <Route path="/profile/:username" element={
            <Profile />
          } />

          <Route path="*" element={
            <SellMySite />
          } />
        </Routes>
      </Router>
    </>
  )
}

export default App
