import { FC, useEffect, useState } from "react";
import * as moment from 'moment'
import './App.css'
import car from './car.png'

type StatusDto = {
  vehicleCount: number,
  trafficLight: string
}

const App: FC = () => {
  const [vehicleFull, setVehicleFull] = useState(undefined)
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

  const createEventListener =
    (eventUrl: string, onMessage: () => any) =>
      new EventSource(eventUrl)
        .addEventListener('message', onMessage)
      
  const createAccidentsEventHandler = () =>
    createEventListener('/accidents/@event', fetchAccidents)

  const createStatusEventHandler = () =>
    createEventListener('/status/@event', fetchStatus)

    const options = "toolbar=no,scrollbars=no,resizable=yes,status=no,menubar=no,width=1200, height=800, top=0,left=0, location=no";

  useEffect(() => {
    void fetchAccidents()
    void fetchStatus()

    createAccidentsEventHandler()
    createStatusEventHandler()
  }, [])

  return (
    <>
    <div className="frame">
      <div className="container">
        <h1><img src={car} width="40px" />&nbsp;신호위반 및 꼬리물기 검출 시스템</h1>
        <div className="relative">
          <div className="relative2">
          <img className="screen" src="http://localhost:8000/video_feed1" />

          <div className="info">
            {(!accidents || !status) && (
              <p>Loading...</p>
            )}
            
            {status && (
              <div>
                <p>차량 수: {status.vehicleCount}대</p>
                <p>교통 신호: <span style={{ color: status.trafficLight === 'GREEN' ? 'yellowgreen' : 'red' }}>{status.trafficLight}</span></p>
              </div>
            )}

            <hr />

            {stats && (
              <div>
                1시간 기준 위반수
                <ul>
                  {Object.keys(stats).map((stat, i) => (
                    <li key={i}>
                      {stat}: {stats[stat]}대
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          </div>
          {accidents && (
                  <div className="table">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>차량사진</th>
                          <th>위반분류</th>
                          <th>위반시각</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accidents.length < 1 && (
                          <tr>
                            <td colSpan={4}>위반사항이 없습니다</td>
                          </tr>
                        )}
                        {accidents.map((accident, i) => (
                          <tr key={i}>
                            <td>{accident.id}</td>
                            <td><img onClick={() => window.open(accident.vehicle.fullPicture, '_blank', options)} className="car" src={accident.vehicle.picture} width={100} /></td>
                            <td>{accident.type.label}</td>
                            <td>{moment(accident.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                          </tr>
                        ))}
                        
                      </tbody>
                    </table>

                  </div>
                )}
        </div>
      </div>

      

      {vehicleFull !== undefined && <img onClick={() => setVehicleFull(undefined)} className="fullscreen" src={vehicleFull} />}
    </div>
    </>
  )
}

export default App
