import { useState } from 'react'
import Plot from 'react-plotly.js'

function randomPoint() {
  const x = (Math.random() * 20) - 10
  const y = (Math.random() * 20) - 10
  return {
    x,
    y
  }
}

function App() {

  const numPoints = 100
  const [data, setData] = useState([...Array(numPoints)].map(() => randomPoint()))

  const newPoints = () => {
    const points = [...Array(numPoints)].map(() => randomPoint())

    setData(() => points)
  }


  return (
    <>
      <h1>Hello</h1>
      <button onClick={newPoints}>New Points</button>
      <Plot
        data={[
          {
            x: data.map(point => point.x),
            y: data.map(point => point.y),
            type: 'scatter',
            mode: 'markers',
            marker: {color: 'red'},
          },
        ]}
        layout={ {width: 650, height: 600, title: 'K-means'} }
      />
    </>
  )
}

export default App
