import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccessAddToken } from '../../Store/Slices/UserSlice';
import {
  changeStartTimestamp,
  changeStepsInStore,
  changeCoordinatesInStore,
  changeNotificationsInStore,
  changeHeartbeatInStore
} from '../../Store/Slices/ChangebleLifeDataSlice';
import { refreshToken } from '../EntranceForm/LoginForm/authService';

export function AuthCheck() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.tokenAuthorization);

  const fetchWithRefresh = async (url, currentToken) => {
    console.log(`🔄 Отправка запроса на ${url}`);
    let res = await fetch(url, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    if (res.status === 401) {
      console.log("⚠️ Токен истек, пытаемся обновить...");
      const refreshed = await refreshToken(dispatch);
      if (refreshed) {
        console.log("✅ Токен успешно обновлен, повторяем запрос");
        res = await fetch(url, {
          headers: { Authorization: `Bearer ${refreshed}` },
        });
      }
    }
    if (!res.ok) {
      throw new Error(`Ошибка при запросе ${url}, статус ${res.status}`);
    }
    return res.json();
  };

  const fetchAllMetrics = async (currentToken) => {
    console.log("🚀 Начинаем загрузку всех метрик...");
    const stop = new Date().toISOString();
    const start = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    console.log(`📅 Период: с ${start} по ${stop}`);

    try {
      // Steps
      {
        console.log("📊 Загрузка данных о шагах...");
        const url = `/api/proxy?start=${start}&stop=${stop}&metricType=steps`;
        const raw = await fetchWithRefresh(url, currentToken);
        const data = raw.map(({ timestamp, value }) => ({
          timestamp,
          value: Number(value),
        }));
        console.log("✅ Шаги загружены:", data);
        if (data.length > 0) {
          dispatch(changeStartTimestamp(data[0].timestamp));
        }
        dispatch(changeStepsInStore(data));
      }

      // Coordinates
      {
        console.log("📍 Загрузка координат...");
        const url = `/api/proxy?start=${start}&stop=${stop}&metricType=coordinates`;
        const raw = await fetchWithRefresh(url, currentToken);
        const data = raw.map(({ timestamp, value }) => {
          const [lat, lng] = value.split(":").map(Number);
          return { timestamp, coords: [lat, lng] };
        });
        console.log("✅ Координаты загружены:", data);
        dispatch(changeCoordinatesInStore(data));
      }

      // Notifications
      {
        console.log("🔔 Загрузка уведомлений...");
        const url = `/api/proxy?start=${start}&stop=${stop}&metricType=notification`;
        const raw = await fetchWithRefresh(url, currentToken);
        const data = raw.map(({ timestamp, value }) => ({ timestamp, value }));
        console.log("✅ Уведомления загружены:", data);
        dispatch(changeNotificationsInStore(data));
      }

      // Heartbeat
      {
        console.log("❤️ Загрузка данных о пульсе...");
        const url = `/api/proxy?start=${start}&stop=${stop}&metricType=heartbeat`;
        const raw = await fetchWithRefresh(url, currentToken);
        const data = raw.map(({ timestamp, value }) => ({
          timestamp,
          value: parseFloat(value),
        }));
        console.log("✅ Данные о пульсе загружены:", data);
        dispatch(changeHeartbeatInStore(data));
      }

      console.log("🎉 Все метрики успешно загружены!");

    } catch (err) {
      console.error("❌ Ошибка при загрузке метрик:", err.message);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (savedToken) {
      console.log("🔑 Найден сохраненный токен, восстанавливаем сессию...");
      dispatch(loginSuccessAddToken(savedToken));
    }
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      console.log("🔄 Токен получен, начинаем загрузку данных...");
      fetchAllMetrics(token);
    }
  }, [token]);

  return null;
} 