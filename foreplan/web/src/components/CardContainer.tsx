import Card, { type CardProps } from "./Card";
import "../styles/Card.css";

export interface CardContainerProps {
    title: string;
    cards: Array<CardProps>;
}

const CardContainer: React.FC<CardContainerProps> = ({ title, cards }) => {
    return (
    <div className="card-container">
        <div className="title">{title}</div>
        <div className="card-list">
            {cards.map((card, index) => (
                <Card key={index} title={card.title} content={card.content} />
            ))}
        </div>
    </div>
    );
}

export default CardContainer;