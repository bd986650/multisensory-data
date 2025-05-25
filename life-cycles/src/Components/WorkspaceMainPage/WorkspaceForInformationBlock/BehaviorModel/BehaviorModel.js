import { useSelector } from 'react-redux';
import styles from './BehaviorModel.module.css';

export function BehaviorModel() {
  const currentTimestamp = useSelector((state) => state.time.time);
  const heartbeat = useSelector((state) => state.changebleLifeData.heartbeat);
  const coordinates = useSelector((state) => state.changebleLifeData.coordinates);

  // Находим текущие значения пульса и координат
  const currentHeartbeat = heartbeat?.find(h => h.timestamp === currentTimestamp)?.value;
  const currentCoords = coordinates?.find(c => c.timestamp === currentTimestamp)?.coords;
  const prevCoords = coordinates?.find(c => new Date(c.timestamp) < new Date(currentTimestamp))?.coords;

  // Определяем, движется ли пользователь
  const isMoving = currentCoords && prevCoords && 
    (currentCoords[0] !== prevCoords[0] || currentCoords[1] !== prevCoords[1]);

  // Определяем состояние сна
  const isSleeping = currentHeartbeat < 100 && !isMoving;

  // Форматируем дату
  const formattedDate = new Date(currentTimestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>Модель поведения</div>
      <div className={styles.date}>{formattedDate}</div>
      <div className={styles.status}>
        {isSleeping ? 'В состоянии покоя' : 'В активном состоянии'}
      </div>
    </div>
  );
} 