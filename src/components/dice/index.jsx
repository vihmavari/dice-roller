import { D4 } from './D4';
import { D6 } from './D6';
import { D8 } from './D8';
import { D10 } from './D10';
import { D12 } from './D12';
import { D20 } from './D20';
import { CommonDice } from './CommonDice';

export const PhysicalDice = ({ type, rollId, onResult }) => {
  const diceType = type?.toLowerCase();

  switch (diceType) {
    case 'd4':
      return <D4 rollId={rollId} onResult={onResult} />;
    case 'd6':
      return <D6 rollId={rollId} onResult={onResult} />;
    case 'd8':
      return <D8 rollId={rollId} onResult={onResult} />;
    case 'd10':
      return <D10 rollId={rollId} onResult={onResult} />;
    case 'd12':
      return <D12 rollId={rollId} onResult={onResult} />;
    case 'd20':
      return <D20 rollId={rollId} onResult={onResult} />;
    default:
      return <CommonDice type={diceType} rollId={rollId} />;
  }
};