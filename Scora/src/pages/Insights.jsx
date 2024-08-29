import React from 'react'
import Sidebar from '../components/Sidebar';
import Bargraph from '../components/Bargraph';

const Insights = () => {
  return (
    <div>
    <div className="analyticpage-container">
        <Sidebar />
        
        <Bargraph />
        </div>
    </div>
  )
}

export default Insights;