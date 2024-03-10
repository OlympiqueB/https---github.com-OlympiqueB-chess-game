export function StalemateScreen({}) {
  return <div className="gameEndBox">STALEMATE</div>;
}

export function MateScreen({ turn }) {
  return <div className="gameEndBox">{turn ? "WHITE" : "BLACK"} WON</div>;
}
