import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartProps {
    titleOne: string;
    titleTwo: string;
    titleThree: string; // added
    dataOne: number[];
    dataTwo: number[];
    dataThree: number[]; // added
    categories: string[];
    dateRange: string;
}

    const ChartTwo: React.FC<ChartProps> = ({ titleOne, titleTwo, titleThree, dataOne, dataTwo, dataThree, categories, dateRange }) => {

    const options: ApexOptions = {
        legend: {
            show: false,
            position: 'top',
            horizontalAlign: 'left',
        },
        colors: ['#3C50E0', '#FF0000', '#00FF00'], // added third color
        chart: {
            fontFamily: 'Satoshi, sans-serif',
            height: 335,
            type: 'area',
            dropShadow: {
                enabled: true,
                color: '#623CEA14',
                top: 10,
                blur: 4,
                left: 0,
                opacity: 0.1,
            },
            toolbar: {
                show: false,
            },
        },
        responsive: [
            {
                breakpoint: 1024,
                options: {
                chart: {
                    height: 300,
                },
                },
            },
            {
                breakpoint: 1366,
                options: {
                chart: {
                    height: 350,
                },
                },
            },
        ],
        stroke: {
            width: [2, 2, 2],
            curve: 'straight',
        },
        grid: {
            xaxis: {
                lines: {
                show: true,
                },
            },
            yaxis: {
                lines: {
                show: true,
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
            markers: {
            size: 4,
            colors: '#fff',
            strokeColors: ['#3056D3', '#FF0000', '#00FF00'], // Ubah warna kedua menjadi merah
            strokeWidth: 3,
            strokeOpacity: 0.9,
            strokeDashArray: 0,
            fillOpacity: 1,
            discrete: [],
            hover: {
                size: undefined,
                sizeOffset: 5,
            },
        },
        xaxis: {
            type: 'category',
            categories: categories,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            title: {
                style: {
                fontSize: '0px',
                },
            },
            min: Math.min(0),
            max: Math.max(...dataOne, ...dataTwo, ...dataThree) + 10,
        },
    };

    const series = [
        {
            name: titleOne,
            data: dataOne,
        },
        {
            name: titleTwo,
            data: dataTwo,
        },
        {
            name: titleThree,
            data: dataThree,
        },
    ];

    return (
        <div className="w-full rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
                <div className="flex w-full gap-3 sm:gap-5 flex-col sm:flex-row">
                    <div className="flex min-w-47.5">
                        <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-primary">{titleOne}</p>
                            <p className="text-sm font-medium">{dateRange}</p>
                        </div>
                    </div>
                    <div className="flex min-w-47.5">
                        <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-red-500">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-red-500"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-red-500">{titleTwo}</p>
                            <p className="text-sm font-medium">{dateRange}</p>
                        </div>
                    </div>
                    <div className="flex min-w-47.5">
                        <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-green-500">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-green-500"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-green-500">{titleThree}</p>
                            <p className="text-sm font-medium">{dateRange}</p>
                        </div>
                    </div>
                </div>
                
            </div>

            <div>
                <div id="chartOne" className="-ml-5">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="area"
                        height={350}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChartTwo;