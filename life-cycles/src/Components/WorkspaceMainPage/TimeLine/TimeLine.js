import { useState, useEffect } from "react";
import Slider from "react-slider";
import { useDispatch, useSelector } from "react-redux";
import { addTimeInStore } from "../../../Store/Slices/TimeSlice";
import styles from "./TimeLine.module.css";

export function Timeline({ onTimeChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  // Получаем данные из Redux
  const stepsData = useSelector(state => state.changebleLifeData.steps) || [];
  const coordinatesData = useSelector(state => state.changebleLifeData.coordinates) || [];
  const notificationsData = useSelector(state => state.changebleLifeData.notifications) || [];
  const pulseData = useSelector(state => state.changebleLifeData.pulse) || [];
  const startTimestamp = useSelector(state => state.changebleLifeData.startTimestamp);

  // Объединяем все данные в один массив
  const allEvents = [
    ...stepsData.map(item => ({ ...item, type: 'step' })),
    ...coordinatesData.map(item => ({ ...item, type: 'coordinate' })),
    ...notificationsData.map(item => ({ ...item, type: 'notification' })),
    ...pulseData.map(item => ({ ...item, type: 'pulse' }))
  ];

  // Сортируем по времени
  allEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  useEffect(() => {
    if (allEvents.length > 0 && !startTimestamp) {
      console.warn("Нет стартового таймштампа");
    }
  }, [allEvents, startTimestamp]);

  const formatReadableDate = (isoString) => {
    const date = new Date(isoString);
    const day = date.getDate();
    const monthNames = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];
    const month = monthNames[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month}, ${hours}:${minutes}`;
  };

  const handleSliderChange = (index) => {
    setCurrentIndex(index);
    if (!allEvents[index]) return;
    const ts = allEvents[index].timestamp;
    dispatch(addTimeInStore(ts));
    onTimeChange?.(ts);
  };

  const currentTimestamp = allEvents[currentIndex]?.timestamp;

  return (
    <div className={styles.container}>
      <h2>Таймлайн</h2>
      <Slider
        className={styles.slider}
        min={0}
        max={allEvents.length - 1}
        step={1}
        value={currentIndex}
        onChange={handleSliderChange}
        trackClassName={styles.track}
        thumbClassName={styles.thumb}
        renderThumb={({ key, ...props }) => (
          <div key={key} {...props} className={styles.thumb} />
        )}
      />
      {currentTimestamp && (
        <p className={styles.realTime}>
          Реальное время: {formatReadableDate(currentTimestamp)}
        </p>
      )}
    </div>
  );
}
