import { ButtonMenu } from '../ButtonMenu/ButtonMenu';
import { Logo } from '../Logo/Logo';
import { Profile } from '../Profile/Profile';
import { LogoutButton } from '../../LogoutButton/LogoutButton';
import styles from './Header.module.css'

export function Header() {
  return(
    <div className={styles.header}>
      <div className={styles.leftPartHeader}>
        <Logo/>
        <ButtonMenu text={'Поддержать'} link={'/support'}/>
      </div>
      <div className={styles.rightPartHeader}>
        <LogoutButton />
        <Profile/>
      </div>
    </div>
  );
}