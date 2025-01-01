import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import ProtectedRoute from "./ProtectedRoute.jsx"
import Header from "./Frontend/Header Component/Header.jsx"
import Redeem from "./Frontend/Redeem Component/Redeem.jsx"
import SellMySite from "./Frontend/SellMySite/SellMySite.jsx"
import Profile from "./Frontend/Profile Component/Profile.jsx"
import Settings from "./Frontend/Settings Component/Settings.jsx"
import BuyTokens from "./Frontend/Buy Tokens Component/BuyTokens.jsx"
import Messages from "./Frontend/Private Messages Component/Messages.jsx"
import ViewPost from "./Frontend/Website Component/View/Post/ViewPost.jsx"
import ViewWebsite from "./Frontend/Website Component/View/Website/ViewWebsite.jsx"
import SearchResults from "./Frontend/Search Component/SearchResults/SearchResults.jsx"


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
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />

          <Route path="/profile/:username" element={
            <Profile />
          } />

          <Route path="/search/:query" element={
            <SearchResults />
          } />

          <Route path="/website/:username/:websiteID" element={
            <ViewWebsite />
          } />

          <Route path="/post/:username/:publicPostID" element={
            <ViewPost />
          } />

          <Route path="shop" element={
            <ProtectedRoute>
              <BuyTokens />
            </ProtectedRoute>
          } />

          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="redeem" element={
            <ProtectedRoute>
              <Redeem />
            </ProtectedRoute>
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
