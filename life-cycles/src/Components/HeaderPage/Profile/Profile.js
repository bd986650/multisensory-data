import styles from "./Profile.module.css";
import accountImage from "../../../Images/AccountCircle.png";
import { useDispatch } from 'react-redux';
import { logout } from '../../../Store/Slices/UserSlice';

export function Profile() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
      <div className={styles.profile} onClick={handleLogout}>
        <img alt="" src={accountImage} className={styles.accountImage} />
      </div>
  );
}
