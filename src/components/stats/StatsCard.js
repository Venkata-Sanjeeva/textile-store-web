import "../../styles/StatsCard.css";
const StatsCard = ({ title, value, color }) => {
    const colorMap = {
        primary: "#007bff",
        success: "#28a745",
        danger: "#dc3545"
    };

    return (
        <div className="card shadow-sm border-0 p-3" style={{ borderLeft: `5px solid ${colorMap[color]}` }}>
            <div className="text-muted small text-uppercase font-weight-bold">{title}</div>
            <div className="h3 mb-0 font-weight-bold" style={{ color: colorMap[color] }}>{value}</div>
        </div>
    );
};
export default StatsCard;