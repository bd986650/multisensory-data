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
    let res = await fetch(url, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    if (res.status === 401) {
      const refreshed = await refreshToken(dispatch);
      if (refreshed) {
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
    const stop = new Date().toISOString();
    const start = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // Steps
      {
        const url = `/api/proxy?start=${start}&stop=${stop}&metricType=steps`;
        const raw = await fetchWithRefresh(url, currentToken);
        const data = raw.map(({ timestamp, value }) => ({
          timestamp,
          value: Number(value),
        }));
        if (data.length > 0) {
          dispatch(changeStartTimestamp(data[0].timestamp));
        }
        dispatch(changeStepsInStore(data));
      }

      // Coordinates
      {
        const url = `/api/proxy?start=${start}&stop=${stop}&metricType=coordinates`;
        const raw = await fetchWithRefresh(url, currentToken);
        const data = raw.map(({ timestamp, value }) => {
          const [lat, lng] = value.split(":").map(Number);
          return { timestamp, coords: [lat, lng] };
        });
        dispatch(changeCoordinatesInStore(data));
      }

      // Notifications
      {
        const url = `/api/proxy?start=${start}&stop=${stop}&metricType=notification`;
        const raw = await fetchWithRefresh(url, currentToken);
        const data = raw.map(({ timestamp, value }) => ({ timestamp, value }));
        dispatch(changeNotificationsInStore(data));
      }

      // Heartbeat
      {
        const url = `/api/proxy?start=${start}&stop=${stop}&metricType=heartbeat`;
        const raw = await fetchWithRefresh(url, currentToken);
        const data = raw.map(({ timestamp, value }) => ({
          timestamp,
          value: parseFloat(value),
        }));
        dispatch(changeHeartbeatInStore(data));
      }

    } catch (err) {
      console.error("❌ Ошибка при загрузке метрик:", err.message);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (savedToken) {
      dispatch(loginSuccessAddToken(savedToken));
    }
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      fetchAllMetrics(token);
    }
  }, [token]);

  return null;
} 