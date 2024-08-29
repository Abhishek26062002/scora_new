import React from 'react'
import './Analyticspage.css'
import Sidebar from '../components/Sidebar'
import Bargraph from '../components/Bargraph'
import Correctgraph from '../components/Correctgraph'
import Wronggraph from '../components/Wronggraph'
import Bluegraph from '../components/Bluegraph'
import FullGraph from '../components/Fullgraph'

const Analyticspage = () => {
  return (
    <div>
        <div className="analyticpage-container">
            <Sidebar />
            <div className="analyticpage">
                <div className="graphs">
                    <Correctgraph />
                    <br />
                    <Wronggraph />
                    <br />
                    <Bluegraph />
                </div>
            <br />
            <FullGraph />
            </div>
        </div>
    </div>
  )
}

export default Analyticspage