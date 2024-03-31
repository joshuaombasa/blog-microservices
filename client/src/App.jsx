import { useState } from 'react'

import './App.css'
import CreateStory from './components/CreateStory'
import StoriesList from './components/StoriesList'

function App() {


  return (
    <div className='container'>
      <h1>Famous blog:</h1>
      <CreateStory/>
      <StoriesList/>
    </div>
  )
}

export default App
