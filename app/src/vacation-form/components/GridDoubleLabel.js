const GridDoubleLabel = ({ topText, botText }) => {
  return (
    <div className="vacation-column vacation-grid-box padding vacation-label">
      <p>{topText}</p>
      <p>{botText}</p>
    </div>
  );
};

export default GridDoubleLabel;
