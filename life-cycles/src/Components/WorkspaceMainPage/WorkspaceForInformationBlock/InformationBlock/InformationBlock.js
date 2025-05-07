import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import styles from './InformationBlock.module.css';

export function InformationBlock() {
  const stepsData = useSelector(state => state.changebleLifeData.steps);
  const notificationsData = useSelector(state => state.changebleLifeData.notifications);
  const heartbeatData = useSelector(state => state.changebleLifeData.heartbeat);
  const currentTimestamp = useSelector(state => state.time.time);

  const [currentSteps, setCurrentSteps] = useState("Нет данных");
  const [currentNotif, setCurrentNotif] = useState("Нет данных");
  const [currentBeat, setCurrentBeat] = useState("Нет данных");

  // Функция для поиска последнего значения по времени
  const findLatestBeforeTimestamp = (arr, timestamp) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;

    const targetTime = new Date(timestamp).getTime();

    // Фильтруем те элементы, которые меньше или равны целевому времени
    const filtered = arr.filter(item => new Date(item.timestamp).getTime() <= targetTime);

    // Если есть подходящие записи, берем ту, что ближе всего к целевому времени
    if (filtered.length > 0) {
      return filtered.reduce((latest, item) =>
        new Date(item.timestamp).getTime() > new Date(latest.timestamp).getTime() ? item : latest
      );
    }

    return null; // Нет подходящих данных
  };

  useEffect(() => {
    const currentStepData = findLatestBeforeTimestamp(stepsData, currentTimestamp);
    const currentNotifData = findLatestBeforeTimestamp(notificationsData, currentTimestamp);
    const currentBeatData = findLatestBeforeTimestamp(heartbeatData, currentTimestamp);

    setCurrentSteps(currentStepData ? currentStepData.value : "Нет данных");
    setCurrentNotif(currentNotifData ? extractMessage(currentNotifData.value) : "Нет данных");
    setCurrentBeat(currentBeatData ? currentBeatData.value : "Нет данных");
  }, [currentTimestamp, stepsData, notificationsData, heartbeatData]);

  // Форматирование числовых значений
  const formatValue = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value;
  };

  const extractMessage = (value) => {
    if (!value) return "Нет данных";
    const messageMatch = value.match(/message:([^;]*)/);
    return messageMatch ? messageMatch[1] : value;
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.headerDataContainer}>Информация</div>
      <div className={styles.cardsWrapper}>
        {/* Карточка с шагами */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>👣 Шаги</p>
          <p className={styles.cardValue}>
            {formatValue(currentSteps)}
          </p>
        </div>

        {/* Карточка с пульсом */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>💓 Пульс</p>
          <p className={styles.cardValue}>
            {typeof currentBeat === "number" ? `${currentBeat} уд/мин` : currentBeat}
          </p>
        </div>

        {/* Карточка с уведомлением */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>🔔 Уведомление</p>
          <p className={styles.cardValue}>
            {formatValue(currentNotif)}
          </p>
        </div>
      </div>
    </div>
  );
}
