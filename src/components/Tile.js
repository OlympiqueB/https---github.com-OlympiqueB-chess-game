export function Tile({ piece, color, active, isLight, clickHandler, kingCheck }) {
  return (
    <div
      className={
        kingCheck
          ? "kingInCheck"
          : active
          ? isLight
            ? "highlightedLightTile"
            : "highlightedDarkTile"
          : isLight
          ? "lightTile"
          : "darkTile"
      }
      onClick={clickHandler}
    >
      {piece ? (
        <img
          src={process.env.PUBLIC_URL + `/${color}${piece}.png`}
          width="80"
          height="80"
          alt={piece}
        ></img>
      ) : null}
    </div>
  );
}
