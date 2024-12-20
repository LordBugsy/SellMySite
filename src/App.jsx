import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import Header from "./Frontend/Header Component/Header.jsx"
import SellMySite from "./Frontend/SellMySite/SellMySite.jsx"
import Profile from "./Frontend/Profile Component/Profile.jsx"
import Messages from "./Frontend/Private Messages Component/Messages.jsx"
import ViewWebsite from "./Frontend/Website Component/View/Website/ViewWebsite.jsx"
import SearchResults from "./Frontend/Search Component/SearchResults/SearchResults.jsx"
import ViewPost from "./Frontend/Website Component/View/Post/ViewPost.jsx"
import BuyTokens from "./Frontend/Buy Tokens Component/BuyTokens.jsx"
import Settings from "./Frontend/Settings Component/Settings.jsx"
import Redeem from "./Frontend/Redeem Component/Redeem.jsx"

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

          <Route path="testing" element={
            <BuyTokens />
          } />

          <Route path="/search/:query" element={
            <SearchResults />
          } />

          <Route path="/website/:username/:website" element={
            <ViewWebsite />
          } />

          <Route path="/post/:username/:post" element={
            <ViewPost />
          } />

          <Route path="shop" element={
            <BuyTokens />
          } />

          <Route path="settings" element={
            <Settings />
          } />

          <Route path="redeem" element={
            <Redeem />
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
