import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
  
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          Sub-100ms hot reload for Jetpack Compose
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started/introduction">
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="https://github.com/dev-phantom/jetstart">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function QuickStartSection() {
  return (
    <section className={styles.quickStart}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Quick Start
        </Heading>
        <div className={styles.quickStartContent}>
          <div className={styles.terminal}>
            <div className={styles.terminalHeader}>
              <span className={styles.terminalDot}></span>
              <span className={styles.terminalDot}></span>
              <span className={styles.terminalDot}></span>
              <span className={styles.terminalTitle}>Terminal</span>
            </div>
            <div className={styles.terminalBody}>
              <p><span className={styles.terminalPrompt}>$</span> npx jetstart create my-app --package com.example.app</p>
              <p className={styles.terminalOutput}>✓ Creating JetStart project...</p>
              <p className={styles.terminalOutput}>✓ Installing dependencies...</p>
              <p><span className={styles.terminalPrompt}>$</span> cd my-app</p>
              <p><span className={styles.terminalPrompt}>$</span> npx jetstart dev</p>
              <p className={styles.terminalOutput}>🚀 Development server started!</p>
              <p className={styles.terminalOutput}>⚡ Scan QR code to connect...</p>
            </div>
          </div>
          <div className={styles.quickStartSteps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Create Project</h3>
                <p>Initialize a new JetStart project with one command</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Start Dev Server</h3>
                <p>Run the development server and scan the QR code</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Code & Reload</h3>
                <p>Edit your Kotlin code and see changes instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section className={styles.architecture}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          How It Works
        </Heading>
        <div className={styles.architectureDiagram}>
          <div className={styles.archBlock}>
            <div className={styles.archIcon}>⌨️</div>
            <h4>CLI</h4>
            <p>Command-line interface</p>
          </div>
          <div className={styles.archArrow}>→</div>
          <div className={styles.archBlock}>
            <div className={styles.archIcon}>🔧</div>
            <h4>Core Server</h4>
            <p>Build & DSL parsing</p>
          </div>
          <div className={styles.archArrow}>→</div>
          <div className={styles.archBlock}>
            <div className={styles.archIcon}>📡</div>
            <h4>WebSocket</h4>
            <p>Real-time sync</p>
          </div>
          <div className={styles.archArrow}>→</div>
          <div className={styles.archBlock}>
            <div className={styles.archIcon}>📱</div>
            <h4>Android App</h4>
            <p>Live updates</p>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>&lt;100ms</div>
            <div className={styles.statLabel}>Hot Reload Speed</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>6</div>
            <div className={styles.statLabel}>CLI Commands</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>100%</div>
            <div className={styles.statLabel}>Kotlin Compose</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description="JetStart - Lightning-fast Android development with sub-100ms hot reload for Jetpack Compose">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <QuickStartSection />
        <ArchitectureSection />
      </main>
    </Layout>
  );
}
