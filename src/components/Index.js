import React, { Component } from 'react'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { Marker } from 'react-leaflet/Marker'
import { Popup } from 'react-leaflet/Popup'
import marker_icon from "../icons/gps.png";
import red_marker_icon from "../icons/red_gps.png";
import L from "leaflet";

export default class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roads: [],
            loading: true,
            error: null
        };
    }


    componentDidMount() {
        // if ("geolocation" in navigator) {
        //     console.log("Available");
        // } else {
        //     console.log("Not Available");
        // }

        // navigator.geolocation.getCurrentPosition(function (position) {
        //     console.log("Latitude is :", position.coords.latitude);
        //     console.log("Longitude is :", position.coords.longitude);
        //     console.log(position.coords);
        //     this.setState({ coords: [position.coords.latitude, position.coords.longitude] });
        // });

        fetch(`http://localhost:3001/traffic`)
            .then((response) => response.json())
            .then((actualData) => this.setState({ roads: actualData, error: null }))
            .catch((err) => {
                this.setState({ roads: null, error: err.message })
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    }

    render() {
        let coords = [46.1512, 14.9955];

        // const icon = L.icon({ iconUrl: "../icons/gps.png" });
        const green_icon = new L.Icon({
            iconUrl: marker_icon,
            iconRetinaUrl: marker_icon,
            iconSize: [20, 20],
        });

        const red_icon = new L.Icon({
            iconUrl: red_marker_icon,
            iconRetinaUrl: red_marker_icon,
            iconSize: [20, 20],
        });

        const { roads, loading } = this.state;

        return (
            <MapContainer id="map" center={coords} zoom={8}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {loading || roads.map((road) => {
                    let coord = [road.pos_y, road.pos_x];

                    let road_icon = road.avg_traffic >= 200 ? red_icon : green_icon;
                    return (<Marker key={road._id} position={coord} icon={road_icon}>
                        <Popup>
                            {"Average speed: " + road.avg_spd} <br />
                            {"Average gap between cars: " + road.avg_gap} <br />
                            {"Average traffic: " + road.avg_traffic} <br />
                        </Popup>
                    </Marker>);
                })}

            </MapContainer>
        )
    }
}
