import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { Polyline, FeatureGroup } from 'react-leaflet';
import { useMap } from 'react-leaflet/hooks'
import React, { useState, useEffect } from 'react';
import { Marker, Popup } from "react-leaflet";

export default function HistoryMap(props) {
    const [center, setCenter] = useState([46.1512, 14.9955]);
    const [zoom, setZoom] = useState(8);

    function ChangeView(props) {
        const map = useMap();
        map.preferCanvas = true;

        useEffect(() => {
            console.log(center, zoom, props.center, props.zoom);
            if (center !== props.center || zoom !== props.zoom) {
                if (props.center || props.zoom) {
                    console.log('update');
                    setCenter(props.center);
                    setZoom(props.zoom);
                    map.setView(props.center, props.zoom);
                }
            }
        });

        return null;
    }

    return (
        <MapContainer id="map"
            center={[46.1512, 14.9955]}
            zoom={8}
        >
            <ChangeView center={props.center} zoom={props.zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {props.history.length !== 0 && props.history.map((data) => {
                const positions = data.history.map((element) =>
                    [element.position.latitude, element.position.longitude])
                return (
                    <FeatureGroup key={data._id}>
                        <Polyline key={data._id} pathOptions={{ color: 'red' }} positions={positions} />
                        {
                            data.history.map((element) => {
                                let accelerometer = `Accelerometer: ${element.accelerometer.x.toFixed(2)}, ${element.accelerometer.y.toFixed(2)}, ${element.accelerometer.z.toFixed(2)}`
                                let magnetometer = `Magnetometer: ${element.magnetometer.x.toFixed(2)}, ${element.magnetometer.y.toFixed(2)}, ${element.magnetometer.z.toFixed(2)}`
                                return (
                                    <Marker key={element._id} position={[element.position.latitude, element.position.longitude]}>
                                        <Popup>
                                            {accelerometer} <br />
                                            {magnetometer}
                                        </Popup>
                                    </Marker>
                                );
                            }
                            )
                        }
                    </FeatureGroup>
                );
            })}
        </MapContainer>
    );
}