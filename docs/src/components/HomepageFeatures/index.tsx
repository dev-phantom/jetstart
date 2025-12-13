import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Lightning Fast Hot Reload',
    icon: '⚡',
    description: (
      <>
        Edit your UI code and see changes in <strong>under 100ms</strong>. No rebuild,
        no reinstall - just instant updates on your device.
      </>
    ),
  },
  {
    title: 'Dual Reload System',
    icon: '🔄',
    description: (
      <>
        Smart DSL-based hot reload for UI changes, with automatic fallback to
        full Gradle builds for logic changes. Best of both worlds.
      </>
    ),
  },
  {
    title: 'QR Code Connect',
    icon: '📱',
    description: (
      <>
        Scan a QR code and connect your device instantly. No complex setup,
        no cables required - just scan and start coding.
      </>
    ),
  },
  {
    title: 'Real Kotlin Compose',
    icon: '💻',
    description: (
      <>
        Write actual Kotlin Compose code, not configuration files. Full IDE
        support with autocomplete, type checking, and refactoring.
      </>
    ),
  },
  {
    title: 'WebSocket Real-Time',
    icon: '📡',
    description: (
      <>
        Real-time communication via WebSocket protocol ensures instant
        synchronization between your code and running app.
      </>
    ),
  },
  {
    title: 'Session Isolation',
    icon: '🔒',
    description: (
      <>
        Secure, isolated development sessions with unique tokens. Multiple
        projects can run simultaneously without interference.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <div className={styles.featureContent}>
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className={styles.featuresTitle}>
          Why JetStart?
        </Heading>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
