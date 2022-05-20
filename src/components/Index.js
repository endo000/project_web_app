import React, { Component } from 'react'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { Marker } from 'react-leaflet/Marker'
import { Popup } from 'react-leaflet/Popup'
import marker_icon from "../icons/gps.png";
import red_marker_icon from "../icons/red_gps.png";
import L from "leaflet";
import Container from 'react-bootstrap/esm/Container'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        // title: {
        //     display: true,
        //     text: 'Chart.js Bar Chart',
        // },
    },
};

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

export default class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roads: [],
            charts: [],
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

        this.fetchData();
        this.intervalId = setInterval(this.fetchData, 1000 * 5);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    fetchData = () => {
        fetch(`http://localhost:3001/traffic`)
            .then((response) => response.json())
            .then((data) => {
                const charts = [
                    { property: 'avg_spd', label: 'Average Speed', color: 'rgb(11, 132, 165)' },
                    { property: 'avg_gap', label: 'Average Gap', color: 'rgb(246, 200, 95)' },
                    { property: 'avg_traffic', label: 'Average Traffic', color: 'rgb(111, 78, 124)' }
                ].map((chart) => this.getFrequencies(data, chart));

                this.setState({
                    roads: data,
                    charts: charts,
                    error: null
                });
            })
            .catch((err) => {
                this.setState({ roads: null, error: err.message })
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    }

    getFrequencies(data, chart) {
        const { property, label, color } = chart;

        let min_speed = data.reduce((prev, curr) => curr[property] < prev[property] ? curr : prev);
        let max_speed = data.reduce((prev, curr) => curr[property] > prev[property] ? curr : prev);

        const class_width = (max_speed[property] - min_speed[property]) / 10;
        const labels = Array(10).fill().map((_, idx) => ((idx + 1) * class_width).toFixed(2));

        const freqs = labels.map((label) =>
            data.filter((actual) => label - class_width <= actual[property] && actual[property] <= label).length
        )
        return {
            id: property,
            labels: labels,
            datasets: [{
                label: label,
                data: freqs,
                backgroundColor: color
            }]
        }
    }

    render() {
        const { roads, charts, loading } = this.state;

        return (
            <>
                <MapContainer id="map" center={[46.1512, 14.9955]} zoom={8}>
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
                {loading ||
                    <Container className="mt-2">
                        <h3>Current traffic status</h3>
                        {charts.map((chart) => {
                            let data = {
                                labels: chart.labels,
                                datasets: chart.datasets
                            };
                            return (
                                <Bar options={options} data={data} key={chart.id} />
                            );
                        })}
                    </Container>
                }
            </>
        )
    }
}
