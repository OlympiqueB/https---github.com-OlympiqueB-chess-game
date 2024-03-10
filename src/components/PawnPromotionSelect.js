export function PawnPromotionSelect({ onSelectPromotion, color }) {
  return (
    <div className="promotionPopup">
      <img
        alt="Queen"
        width="170"
        height="170"
        src={process.env.PUBLIC_URL + `${color}Queen.png`}
        onClick={() => onSelectPromotion("Queen")}
      ></img>
      <img
        alt="Rook"
        width="170"
        height="170"
        src={process.env.PUBLIC_URL + `${color}Rook.png`}
        onClick={() => onSelectPromotion("Rook")}
      ></img>
      <img
        alt="Knight"
        width="170"
        height="170"
        src={process.env.PUBLIC_URL + `${color}Knight.png`}
        onClick={() => onSelectPromotion("Knight")}
      ></img>
      <img
        alt="Bishop"
        width="170"
        height="170"
        src={process.env.PUBLIC_URL + `${color}Bishop.png`}
        onClick={() => onSelectPromotion("Bishop")}
      ></img>
    </div>
  );
}
