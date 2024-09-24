import { useState } from 'react'
import Plot from 'react-plotly.js'
import "./styles.css"

function randomDataPoint() {
  return {
    ...randomPoint(),
    color: "magenta",
    id: -1
  }
}

function randomPoint() {
  const x = (Math.random() * 20) - 10
  const y = (Math.random() * 20) - 10

  return {
    x,
    y
  }
}

function validNumber(num, totalPoints) {
  return (num > 0 && num <= totalPoints)|| num == ""
}

function centerColor(n) {
  const rgb = [0,0,0]
  rgb[n % 3] = ((n + 1) * 111) % 255
  rgb[(n + 1) % 3] = ((n + 1) * 13) % 255
  rgb[(n + 2) % 3] = ((n + 1) * 5) % 255

  const color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`

  return color
}

function App() {

  const numPoints = 100
  const [data, setData] = useState([...Array(numPoints)].map(() => randomDataPoint()))
  const [centers, setCenters] = useState([])

  const [method, setMethod] = useState("Random")
  const [warning, setWarning] = useState(false)
  const [k, setK] = useState(2)

  const newPoints = () => {
    setCenters(() => [])
    const points = [...Array(numPoints)].map(() => randomDataPoint())

    setData(() => points)
  }

  const invalid = prevNum => {
    setWarning(() => true)

    return prevNum
  }

  const valid = num => {
    setWarning(() => false)
    setCenters(() => [])

    return num
  }

  const addCenter = point => {
    setCenters(prevCenters => [...prevCenters, {
      ...point,
      color: centerColor(prevCenters.length),
      id: prevCenters.length
    }])
  }

  const randomCenters = () => {
    setCenters(() => [])
    for(let i = 0; i < k; i++) {
      addCenter(randomPoint())
    }
  }

  const clickPoint = e => {
    if (method === "Manual" && centers.length < k) {
      const point = e.points[0]
      addCenter({x: point.x, y: point.y})
    }
  }

  const methodChanged = e => {
    setCenters(() => [])
    setMethod(() => e.target.value)
  }


  return (
    <div className="app-container">
      <h1>Visualization of KMeans</h1>

      <label htmlFor="clusters">Number of Clusters (k):</label>
      <input type="number" name="clusters" id="clusters" value={k} onChange={e => setK(prevK => validNumber(e.target.value, numPoints)? valid(e.target.value): invalid(prevK))}/>

      {warning && <div>Please enter a number between 1 and {numPoints}</div>}

      <label htmlFor="method">Center Initialization Method:</label>
      <select name="method" id="method" value={method} onChange={methodChanged}>
        <option value="Random">Random</option>
        <option value="Farthest First">Farthest First</option>
        <option value="KMeans++">KMeans++</option>
        <option value="Manual">Manual</option>
      </select>

      <button>Step Through KMeans</button>

      <button>Run to Convergence</button>

      <button onClick={newPoints}>Generate New Dataset</button>

      <button onClick={() => setCenters(() => [])}>Reset Algorithm</button>

      <button onClick={randomCenters}>TEST: Random Centers</button>

      <Plot
        data={[
          {
            x: data.map(point => point.x),
            y: data.map(point => point.y),
            name: "Data",
            type: "scatter",
            mode: "markers",
            marker: {color: data.map(point => point.color)},
          },
          {
            x: centers.map(point => point.x),
            y: centers.map(point => point.y),
            name: "Centers",
            type: "scatter",
            mode: "markers",
            marker: {color: centers.map(point => point.color), size: 10}
          },
        ]}
        layout={ {width: 6, height: 560, title: `K-means: ${method}`} }
        onClick={clickPoint}
      />
    </div>
  )
}

export default App
