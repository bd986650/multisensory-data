import { useState, useEffect } from "react";
import { ButtonAcceptForm } from "../ButtonAcceptForm/ButtonAcceptForm";
import { FieldForInput } from "../FieldForInput/FieldForInput";
import { FieldForInputPassword } from "../FieldForInputPassword/FieldForInputPassword";
import styles from "./LoginForm.module.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { loginSuccessAddToken, loginSuccessAddUsername } from "../../../Store/Slices/UserSlice";

export function LoginForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.tokenAuthorization);

  useEffect(() => {
    const saved = localStorage.getItem("accessToken");
    if (saved) dispatch(loginSuccessAddToken(saved));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await axios.post(
        "/api/login",
        new URLSearchParams({ username: login, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      dispatch(loginSuccessAddToken(resp.data.accessToken));
      dispatch(loginSuccessAddUsername(login));
      localStorage.setItem("accessToken", resp.data.accessToken);
      localStorage.setItem("refreshToken", resp.data.refreshToken);
      navigate("/home");

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError("Сервер не отвечает. Попробуйте позже.");
      } else {
        setError("Ошибка: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <FieldForInput signField="Логин" type="text" login={login} setLogin={setLogin} />
      <FieldForInputPassword
        signField="Пароль"
        password={password}
        setPassword={setPassword}
      />
      {error && <div className={styles.error}>{error}</div>}
      <ButtonAcceptForm
        type="submit"
        text={loading ? "Загрузка..." : "Войти"}
        isDisabled={!login || !password}
      />
    </form>
  );
}
