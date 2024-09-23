import { useState } from 'react'
import Plot from 'react-plotly.js'
import "./styles.css"

function randomPoint() {
  const x = (Math.random() * 20) - 10
  const y = (Math.random() * 20) - 10
  return {
    x,
    y,
    color: "blue"
  }
}

function validNumber(num, totalPoints) {
  return (num > 0 && num <= totalPoints)|| num == ""
}

function App() {

  const numPoints = 100
  const [data, setData] = useState([...Array(numPoints)].map(() => randomPoint()))
  const [centers, setCenters] = useState([])
  const [method, setMethod] = useState("Random")
  const [warning, setWarning] = useState(false)
  const [k, setK] = useState(2)

  const newPoints = () => {
    const points = [...Array(numPoints)].map(() => randomPoint())

    setData(() => points)
  }

  const invalid = prevNum => {
    setWarning(() => true)

    return prevNum
  }

  const valid = num => {
    setWarning(() => false)

    return num
  }


  return (
    <div className="app-container">
      <h1>Visualization of KMeans</h1>

      <label htmlFor="clusters">Number of Clusters (k):</label>
      <input type="number" name="clusters" id="clusters" value={k} onChange={e => setK(prevK => validNumber(e.target.value, numPoints)? valid(e.target.value): invalid(prevK))}/>

      {warning && <div>Please enter a number between 1 and {numPoints}</div>}

      <label htmlFor="method">Center Initialization Method:</label>
      <select name="method" id="method" value={method} onChange={e => setMethod(() => e.target.value)}>
        <option value="Random">Random</option>
        <option value="Farthest First">Farthest First</option>
        <option value="KMeans++">KMeans++</option>
        <option value="Manual">Manual</option>
      </select>

      <button>Step Through KMeans</button>

      <button>Run to Convergence</button>

      <button onClick={newPoints}>Generate New Dataset</button>

      <button>Reset Algorithm</button>

      <Plot
        data={[
          {
            x: data.map(point => point.x),
            y: data.map(point => point.y),
            type: 'scatter',
            mode: 'markers',
            marker: {color: data.map(point => point.color)},
          },
        ]}
        layout={ {width: 6, height: 560, title: `K-means: ${method}`} }
      />
    </div>
  )
}

export default App
