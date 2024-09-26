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

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

function assign(point, centers) {
  let closestCenter = centers[0]
  let minDist = distance(point, closestCenter)
  for (let center of centers) {
    const currDist = distance(point, center)
    if (currDist < minDist) {
      minDist = currDist
      closestCenter = center
    }
  }

  return {
    id: closestCenter.id,
    color: closestCenter.color
  }
}

function areCentersDifferent(oldCenters, newCenters) {
  for(let i = 0; i < oldCenters.length; i++) {
    if(oldCenters[i].x !== newCenters[i].x || oldCenters[i].y !== newCenters[i].y) {
      return true
    }
  }

  return false
}

function newCenterCoords(data, center) {
  let xSum = 0
  let ySum = 0
  let numInCluster = 0
  for (let point of data) {
    if (point.id === center.id) {
      numInCluster++
      xSum += point.x
      ySum += point.y
    }
  }

  return {
    x: xSum / numInCluster,
    y: ySum / numInCluster
  }
}

function newCenters(data, centers) {
  return centers.map(center => {
    const newPoints = newCenterCoords(data, center)
    return {
      ...center,
      x: newPoints.x,
      y: newPoints.y
    }
  })
}

function assignPoints(data, centers) {
  return data.map(point => {

    const assignment = assign(point, centers)


    return {
      ...point,
      id: assignment.id,
      color: assignment.color
    }

  })
}

function averageDistance(centers, dataPoint) {
  let distanceSum = 0

  for (let center of centers) {
    distanceSum += distance(dataPoint, center)
  }

  return distanceSum / centers.length

}

function App() {

  const numPoints = 100
  const [data, setData] = useState([...Array(numPoints)].map(() => randomDataPoint()))
  const [centers, setCenters] = useState([])
  const [pointAssigned, setPointsAssigned] = useState(false)

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


    const newCenters = [...Array(k)].map((value, index) => {
      const point = randomPoint()

      return {
        ...point,
        color: centerColor(index),
        id: index
      }
    })


    return newCenters


  }

  const farthestCenters = data => {
    const newCenters = []
    const randomPoint = data[Math.floor(Math.random() * data.length)]

    newCenters.push(
      {
        x: randomPoint.x,
        y: randomPoint.y,
        color: centerColor(newCenters.length),
        id: newCenters.length
      }
    )

    for(let x = 1; x < k; x++) {
      let farthestPoint = data[0]
      let farthestDistance = averageDistance(newCenters, data[0])
      for(let dataPoint of data) {
        const currDistance = averageDistance(newCenters, dataPoint)
        if (currDistance > farthestDistance) {
          farthestDistance = currDistance
          farthestPoint = dataPoint
        }
      }

      newCenters.push(
        {
          x: farthestPoint.x,
          y: farthestPoint.y,
          color: centerColor(newCenters.length),
          id: newCenters.length
        }
      )

    }

    return newCenters

  }

  const plusplusCenters = data => {
    const newCenters = []
    const randomPoint = data[Math.floor(Math.random() * data.length)]

    newCenters.push(
      {
        x: randomPoint.x,
        y: randomPoint.y,
        color: centerColor(newCenters.length),
        id: newCenters.length
      }
    )

    // TODO: Have it add centers with a probability proportional to the distance squared

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

  const initCenters = () => {
    if(method === "Random") {
      return randomCenters()
    } else if(method === "Farthest First") {
      return farthestCenters(data)
    } else {
      return plusplusCenters(data)
    } 

  }

  const step = () => {
    if (centers.length !== k) {
      if (method === "Manual") {
        // HANDLE NOT ENOUGH POINTS SELECTED
        alert(`Need to assign ${k} points`)
        return 
      }
      // CREATE CENTERS AND ASSIGN DATA
      const initialCenters = initCenters()
      const assignedData = assignPoints(data, initialCenters)
      setCenters(() => initialCenters)
      setData(() => assignedData)
      setPointsAssigned(() => true)
    } else if (!pointAssigned) {
      const assignedData = assignPoints(data, centers)
      setData(() => assignedData)
      setPointsAssigned(() => true)
    } else {
      // RECALCULATE CENTERS AND CHECK IF CENTERS CHANGED
      const recalculatedCenters = newCenters(data, centers)

      if (!areCentersDifferent(centers, recalculatedCenters)) {
        alert("K Means is Done!")
        return
      }

      // ASSIGN DATA IF CENTERS CHANGED
      const newAssignments = assignPoints(data, recalculatedCenters)

      setData(() => newAssignments) 
      setCenters(() => recalculatedCenters)
    }

  }

  const runToEnd = () => {

    let currCenters = centers
    let currData = data

    if (currCenters.length !== k) {
      if (method === "Manual") {
        alert("assign k points")
      }

      currCenters = initCenters()
      currData = assignPoints(currData, currCenters)


    } else if (!pointAssigned) {
      currData = assignPoints(currData, currCenters)
    }

    let recalculatedCenters = newCenters(currData, currCenters)

    while (areCentersDifferent(currCenters, recalculatedCenters)) {
      currCenters = recalculatedCenters
      currData = assignPoints(currData, currCenters)
      recalculatedCenters = newCenters(currData, currCenters)
    }

    setData(() => currData)
    setCenters(() => currCenters)
  }


  return (
    <div className="app-container">
      <h1>Visualization of KMeans</h1>

      <label htmlFor="clusters">Number of Clusters (k):</label>
      <input type="number" name="clusters" id="clusters" value={k} onChange={e => setK(prevK => validNumber(e.target.value, numPoints)? Number(valid(e.target.value)): Number(invalid(prevK)))}/>

      {warning && <div>Please enter a number between 1 and {numPoints}</div>}

      <label htmlFor="method">Center Initialization Method:</label>
      <select name="method" id="method" value={method} onChange={methodChanged}>
        <option value="Random">Random</option>
        <option value="Farthest First">Farthest First</option>
        <option value="KMeans++">KMeans++</option>
        <option value="Manual">Manual</option>
      </select>

      <button onClick={step}>Step Through KMeans</button>

      <button onClick={runToEnd}>Run to Convergence</button>

      <button onClick={newPoints}>Generate New Dataset</button>

      <button onClick={() => setCenters(() => [])}>Reset Algorithm</button>

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
