import { useSelector } from 'react-redux';
import styles from './BehaviorModel.module.css';

export function BehaviorModel() {
  const currentTimestamp = useSelector((state) => state.time.time);
  const heartbeat = useSelector((state) => state.changebleLifeData.heartbeat);
  const coordinates = useSelector((state) => state.changebleLifeData.coordinates);
  const steps = useSelector((state) => state.changebleLifeData.steps);

  // Находим текущие значения
  const currentHeartbeat = heartbeat?.find(h => h.timestamp === currentTimestamp)?.value;
  const currentSteps = steps?.find(s => s.timestamp === currentTimestamp)?.value;
  const currentCoords = coordinates?.find(c => c.timestamp === currentTimestamp)?.coords;
  const prevCoords = coordinates?.find(c => new Date(c.timestamp) < new Date(currentTimestamp))?.coords;

  // Определяем, движется ли пользователь
  const isMoving = currentCoords && prevCoords && 
    (currentCoords[0] !== prevCoords[0] || currentCoords[1] !== prevCoords[1]);

  // Определяем состояние
  const isSleeping = currentHeartbeat < 70 && 
                    (!currentSteps || currentSteps === 0) && 
                    !isMoving;

  const isWalking = currentHeartbeat >= 70 && 
                   currentSteps > 0 && 
                   isMoving;

  // Форматируем дату
  const formattedDate = new Date(currentTimestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Определяем статус
  let status = 'Не определено';
  if (isSleeping) {
    status = 'Сон';
  } else if (isWalking) {
    status = 'Ходьба';
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>Модель поведения</div>
      <div className={styles.date}>{formattedDate}</div>
      <div className={styles.status}>
        {status}
      </div>
      <div className={styles.details}>
        <div>Пульс: {currentHeartbeat || 'Нет данных'} уд/мин</div>
        <div>Шаги: {currentSteps || 0}</div>
        <div>Движение: {isMoving ? 'Да' : 'Нет'}</div>
      </div>
    </div>
  );
} 