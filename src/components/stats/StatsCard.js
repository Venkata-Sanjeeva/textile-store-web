const StatsCard = ({ title, value, color }) => (
    <div className={`col-md-4 card border-left-${color} shadow h-100 py-2`}>
        <div className="card-body">
            <div className="text-xs font-weight-bold text-uppercase mb-1">{title}</div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">{value}</div>
        </div>
    </div>
);

export default StatsCard;