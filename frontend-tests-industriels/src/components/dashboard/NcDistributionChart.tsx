import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface NcDistributionChartProps {
    data?: {
        series?: number[];
        labels?: string[];
    };
}

const NcDistributionChart = ({ data }: NcDistributionChartProps) => {
    const series = data?.series && data.series.length > 0 ? data.series : [0, 0, 0, 0];
    const labels = data?.labels && data.labels.length > 0 ? data.labels : ["A", "B", "C", "D"];

    const totalNC = series.reduce((a, b) => a + b, 0);

    const options: ApexOptions = {
        chart: {
            type: 'radialBar',
            sparkline: { enabled: true },
            offsetY: -10
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: {
                    size: '65%',
                },
                track: {
                    background: "#f1f5f9",
                    strokeWidth: '97%',
                    margin: 5, // margin is in pixels
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '11px',
                        fontWeight: 900,
                        offsetY: -10,
                        color: '#94a3b8',
                    },
                    value: {
                        offsetY: -40,
                        fontSize: '34px',
                        fontWeight: 900,
                        color: '#1e293b',
                        formatter: function () {
                            return totalNC.toString();
                        }
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                shadeIntensity: 0.4,
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 50, 53, 91]
            },
        },
        labels: ['Volume NC'],
        colors: ["#00C853"], // Emerald Green base
    };

    const percentages = series.map(v => totalNC > 0 ? Math.round((v / totalNC) * 100) : 0);

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-full flex flex-col">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Efficacité Qualité</h2>
            <div className="flex-1 flex flex-col justify-center">
                <ReactApexChart
                    options={options}
                    series={[Math.min(100, (totalNC / 20) * 100)]} // Mocked filled state for gauge visualization
                    type="radialBar"
                    height={380}
                />

                <div className="mt-2 grid grid-cols-2 gap-6">
                    {labels.map((label, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                            <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: ["#00C853", "#2E5BFF", "#FFAB00", "#FF1744", "#6366f1", "#8b5cf6"][index % 6] }}
                            />
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase truncate">{label}</p>
                                <p className="text-sm font-black text-slate-900">{percentages[index]}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NcDistributionChart;
