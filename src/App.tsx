import { FC, useEffect, useState } from "react";
import * as moment from 'moment'
import './App.css'

type StatusDto = {
  vehicleCount: number,
  trafficLight: string
}

const App: FC = () => {
  const [accidents, setAccidents] = useState<object | undefined>(undefined)
  const [stats, setStats] = useState<Record<string, number> | undefined>(undefined)
  const [status, setStatus] = useState<StatusDto | undefined>(undefined)
  
  const fetchAccidents = () =>
    fetch('/accidents')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setAccidents(res.data?.accidents)
          setStats(res.data?.statics)
        }}) 

  const fetchStatus = () =>
    fetch('/status')
      .then((res) => res.json())
      .then((res) => res.success && setStatus(res.data?.status))

  const createEventListener = (eventUrl: string, onMessage: () => any) =>
    new EventSource(eventUrl)
      .addEventListener('message', onMessage)
      
  const createAccidentsEventHandler = () =>
    createEventListener('/accidents/@event', fetchAccidents)

  const createStatusEventHandler = () =>
    createEventListener('/status/@event', fetchStatus)

  useEffect(() => {
    void fetchAccidents()
    void fetchStatus()

    createAccidentsEventHandler()
    createStatusEventHandler()
  }, [])

  return (
    <>
      <img src="http://localhost:8000/video_feed1/" width={800} />


      {(!accidents || !status) && (
        <p>Loading...</p>
      )}
      
      {status && (
        <div>
          <p>차량 수: {status.vehicleCount}대</p>
          <p>신호: {status.trafficLight}</p>
        </div>
      )}

      {stats && (
        <div>
          1시간 기준
          <ul>
            {Object.keys(stats).map((stat, i) => (
              <li key={i}>
                {stat}: {stats[stat]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {accidents && (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>트래킹id</th>
              <th>위반분류</th>
              <th>위반시간</th>
            </tr>
          </thead>
          <tbody>
            {accidents.map((accident, i) => (
              <tr key={i}>
                <td>{accident.id}</td>
                <td>{accident.vehicleId}</td>
                <td>{accident.type.label}</td>
                <td>{moment(accident.createdAt).format('YYYY-MM-DD HH:mm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

export default App
