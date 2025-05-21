import { loginSuccessAddToken } from "../../../Store/Slices/UserSlice";

const refreshToken = async (dispatch) => {
  const storedRefreshToken = localStorage.getItem("refreshToken");
  if (!storedRefreshToken) {
    console.error("Нет refreshToken в localStorage");
    return null;
  }

  const url = "http://51.250.108.190:8080/api/auth/refresh";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${storedRefreshToken}`, 
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка обновления токена: ${response.statusText}`);
    }

    const contentType = response.headers.get("Content-Type");

    if (contentType && contentType.includes("text/plain")) {
      const newAccessToken = await response.text(); 
      console.log("🔄 Новый access токен:", newAccessToken);

      localStorage.setItem("accessToken", newAccessToken);
      dispatch(loginSuccessAddToken(newAccessToken));
      return newAccessToken;
    } else {
      throw new Error("Ответ сервера не в формате text/plain.");
    }
  } catch (error) {
    console.error("Ошибка при обновлении токена:", error);
    return null;
  }
};

export { refreshToken };
