const GridTripleLabel = ({ topText, leftText, rightText }) => {
  return (
    <div className="vacation-label-triple vacation-grid-box vacation-column-reverse vacation-label">
      <div className="vacation-row">
        <div className="vacation-grid-box-triple-left padding">
          <p>{leftText}</p>
        </div>
        <div className="vacation-grid-box-triple-right padding">
          <p>{rightText}</p>
        </div>
      </div>

      <div>
        <p>{topText}</p>
      </div>
    </div>
  );
};

export default GridTripleLabel;
