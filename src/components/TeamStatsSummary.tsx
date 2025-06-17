interface TeamStatsSummaryProps {
  teamTotalStats: { [key: string]: number };
}

const TeamStatsSummary: React.FC<TeamStatsSummaryProps> = ({ teamTotalStats }) => {

  const statsEntries = Object.entries(teamTotalStats);

  return (
    <div className="team-stats-summary-container">
      <h3>Team Strength Summary</h3>
      {statsEntries.length > 0 ? (
        <div className="stats-grid-summary">
          {statsEntries.map(([statName, total]) => (
            <div key={statName} className="stat-item-summary">
              <span className="stat-name-summary">{statName.replace('-', ' ').toUpperCase()}:</span>
              <span className="stat-value-summary">{total}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-stats-message">Add Pokémon of your choice to your team to see total stats.</p>
      )}
    </div>
  );
};

export default TeamStatsSummary;