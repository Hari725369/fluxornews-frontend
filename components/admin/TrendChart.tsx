import React from 'react';

interface DailyStat {
    date: string;
    views: number;
    articles: number;
}

interface TrendChartProps {
    data: DailyStat[];
    title?: string;
    subtitle?: string;
    height?: string;
    onRangeChange?: (days: number) => void;
}

export default function TrendChart({
    data,
    title = "Views Trend",
    subtitle = "Last 30 Days Performance",
    height = "h-48",
    onRangeChange
}: TrendChartProps) {
    const [selectedRange, setSelectedRange] = React.useState(30);

    const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const days = parseInt(e.target.value);
        setSelectedRange(days);
        if (onRangeChange) {
            onRangeChange(days);
        }
    };

    if (!data || data.length === 0) {
        return (
            <div className={`w-full ${height} flex items-center justify-center text-gray-400 text-sm italic border border-dashed border-gray-200 dark:border-gray-700 rounded-xl relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-50" />
                No trend data available
            </div>
        );
    }

    const maxViews = Math.max(...data.map(d => d.views), 1);
    const totalViews = data.reduce((acc, curr) => acc + curr.views, 0);
    const averageViews = Math.round(totalViews / data.length);

    return (
        <div className="relative overflow-hidden bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 transition-opacity duration-500 opacity-50 group-hover:opacity-100" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalViews.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">total views</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {onRangeChange && (
                        <div className="relative">
                            <select
                                value={selectedRange}
                                onChange={handleRangeChange}
                                className="appearance-none bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <option value={7}>Last 7 Days</option>
                                <option value={30}>Last 30 Days</option>
                                <option value={90}>Last 3 Months</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={`${height} flex items-end gap-1 sm:gap-2 pt-4 relative`}>
                {/* Dashed Grid Lines (Optional - keeping clean for now) */}

                {data.map((day, i) => {
                    const heightPercent = (day.views / maxViews) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center group/bar relative min-w-[4px]">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-3 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none z-20 w-32 bg-gray-900/95 dark:bg-black/90 text-white text-xs rounded-lg p-2.5 shadow-xl border border-gray-700 backdrop-blur-sm -translate-y-1 group-hover/bar:translate-y-0">
                                <div className="text-center font-medium mb-1.5 border-b border-gray-700 pb-1 text-gray-300">
                                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="flex justify-between items-center text-gray-300">
                                    <span>Views</span>
                                    <span className="font-bold text-white">{day.views}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-300 mt-1">
                                    <span>Articles</span>
                                    <span className="font-bold text-white">{day.articles}</span>
                                </div>
                                {/* Triangle arrow */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900/95 dark:border-t-black/90"></div>
                            </div>

                            {/* Bar Container - full height for align-items comparison if needed, but here we just use height directly */}
                            <div className="w-full relative flex items-end h-full rounded-t-sm overflow-hidden">
                                {/* The Bar */}
                                <div
                                    className="w-full bg-gradient-to-t from-primary/60 to-primary dark:from-primary/40 dark:to-primary rounded-t-sm transition-all duration-500 ease-out group-hover/bar:brightness-110 relative"
                                    style={{
                                        height: `${Math.max(heightPercent, 2)}%`,
                                        opacity: day.views === 0 ? 0.1 : 1
                                    }}
                                >
                                    {/* Top highlight/glow line */}
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
                                </div>

                                {/* Hover background pill for the full column */}
                                <div className="absolute inset-0 bg-gray-100/50 dark:bg-white/5 opacity-0 group-hover/bar:opacity-100 rounded-lg transition-opacity -z-10 px-[1px] -mx-[1px]" />
                            </div>

                            {/* X-Axis Label */}
                            {((data.length <= 10) || (data.length <= 31 && i % 5 === 0) || (data.length > 31 && i % 10 === 0)) && (
                                <div className="absolute top-full mt-3 text-[10px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                    {new Date(day.date).getDate()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
