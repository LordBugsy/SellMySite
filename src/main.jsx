import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './publicStyles.scss'
import App from './App.jsx'

import { Provider } from 'react-redux'
import store from './Frontend/Redux/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
