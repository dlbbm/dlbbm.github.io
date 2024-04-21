import styles from './styles.module.scss'

type Props = {
}

export default function Logo (props: Props) {
  return <div className={styles['wrapper']} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    <div className={styles['circles']}>
      <div className={styles['circle']}></div>
      <div className={styles['circle']}></div>
    </div>
    <div className={styles['name']}>dlbbm.</div>
  </div>
}
