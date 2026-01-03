import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Smartphone,
  Monitor,
  Globe,
  Zap,
  Code2,
  Rocket,
  Download,
  CheckCircle2,
  Book,
  Package,
  Play,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import GradientBorderWrapper from '../components/gradientBorderWrapper';
import { client } from '../services/sanity/sanityClient';
import { urlFor } from '../services/sanity/imageUrl';
import Link from '@docusaurus/Link';


interface BlogPost {
  title: string;
  slug: string;
  publishedAt: string;
  mainImage: any;
  author: {
    name: string;
  };
}

export default function JetStartLanding() {
  const [activeTab, setActiveTab] = useState(0);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "post"] | order(publishedAt desc)[0...3] {
            title,
            "slug": slug.current,
            publishedAt,
            mainImage,
            author->{name}
          }`
      )
      .then((data) => setLatestPosts(data))
      .catch(console.error);
  }, []);

  // Using CSS variables from custom.css and Tailwind config
  const colors = {
    bgColor: 'var(--jetstart-bg)',
    altBg: 'var(--jetstart-alt-bg)',
    secondary: 'var(--jetstart-secondary)',
    primary: 'var(--jetstart-primary)',
    orange: 'var(--jetstart-orange)',
    textColor: 'var(--jetstart-text)',
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{ backgroundColor: colors.bgColor, color: colors.textColor }}
    >
      {/* Navigation */}
      <nav
        className="fixed top-0 w-full z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.08)',
          backgroundColor: colors.bgColor + 'F0',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <img
                src="img/logos/logo.png"
                alt="JetStart Logo"
                className="w-8 h-8 rounded-md"
              />
              <span className="font-semibold text-base md:text-lg">JetStart</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="/docs/getting-started/introduction"
                className="text-sm hover:text-white transition-colors"
                style={{ color: colors.textColor }}
              >
                Docs
              </a>
              <a
                href="/blogs"
                className="text-sm hover:text-white transition-colors"
                style={{ color: colors.textColor }}
              >
                Blog
              </a>
              <a
                href="https://github.com/dev-phantom/jetstart"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-white transition-colors"
                style={{ color: colors.textColor }}
              >
                GitHub
              </a>
              <a href="/docs/getting-started/introduction">
                <motion.button
                  className="text-sm px-4 py-1.5 rounded-md font-medium transition-all"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.bgColor,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md transition-colors md:hidden"
              style={{
                backgroundColor: '#25FF79',
                color: '#0A0A0A',
              }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={2} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
            style={{
              backgroundColor: colors.bgColor + 'F8',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="px-4 py-4 space-y-3 flex flex-col">
              <a
                href="/docs/getting-started/introduction"
                className="block text-base font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: colors.textColor }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
              </a>
              <a
                href="/blogs"
                className="block text-base font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: colors.textColor }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </a>
              <a
                href="https://github.com/dev-phantom/jetstart"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-base font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: colors.textColor }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                GitHub
              </a>
              <a href="/docs/getting-started/introduction" onClick={() => setIsMobileMenuOpen(false)}>
                <motion.button
                  className="w-full text-center px-4 py-3 rounded-lg font-medium mt-2"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.bgColor,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </a>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-6 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 md:gap-16">
          <motion.div
            className="max-w-xl text-center md:text-left w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6 border"
              style={{
                backgroundColor: colors.altBg,
                borderColor: 'rgba(37, 255, 121, 0.2)',
                color: colors.primary,
              }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: colors.primary }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Android development reimagined
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 md:mb-6 leading-tight tracking-tight">
              Build Android apps
              <br />
              in <span style={{ color: colors.primary }}>VS Code</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 md:mb-10 leading-relaxed max-w-xl mx-auto md:mx-0">
              Develop with Kotlin + Jetpack Compose. Preview on mobile, desktop, or web—instantly.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-12 md:mb-16">
              <Link to="https://www.npmjs.com/package/@jetstart/cli">
                <motion.button
                  className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.bgColor,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                  Install CLI
                </motion.button>
              </Link>
              <Link to="/docs/getting-started/introduction">
                <motion.button
                  className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 border transition-all"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <Book className="w-4 h-4" />
                  Read Docs
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right Side - Code Editor */}
          <motion.div
            className="relative w-full max-w-[520px] mt-4 md:mt-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              perspective: '1500px',
              perspectiveOrigin: 'left center',
            }}
          >
            <motion.div
              style={{
                rotateY: -8,
                rotateX: 2,
              }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <GradientBorderWrapper>
                <div
                  className="rounded-lg overflow-hidden border w-full"
                  style={{
                    backgroundColor: '#252526',
                    borderColor: colors.primary,
                    transform: 'rotateY(-8deg) rotateX(2deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src="https://res.cloudinary.com/phantom1245/image/upload/v1765933925/jetstart/Screenshot_739_rzg81g.png"
                    alt="vscode editor"
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: '250px', objectFit: 'contain' }}
                  />
                </div>
              </GradientBorderWrapper>
            </motion.div>

            {/* Sparkle */}
            <motion.div
              className="absolute -top-4 -right-4 md:-top-8 md:-right-8"
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <svg className="w-6 h-6 md:w-10 md:h-10" viewBox="0 0 40 40" fill="none">
                <path
                  d="M20 0L21.8 18.2L40 20L21.8 21.8L20 40L18.2 21.8L0 20L18.2 18.2L20 0Z"
                  fill={colors.primary}
                  opacity="0.6"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">How It Works</h2>
            <p className="text-gray-400 text-base md:text-lg">Get up and running in three simple steps</p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Install CLI',
                description:
                  'Single command installation via npm. No complex setup or configuration required.',
                tech: ['npm', 'CLI'],
                command: 'npm install -g @jetstart/cli',
              },
              {
                step: '02',
                title: 'Create Project',
                description: 'Scaffold a new Android project with Jetpack Compose in seconds.',
                tech: ['Kotlin', 'Compose'],
                command: 'jetstart create my-app',
              },
              {
                step: '03',
                title: 'Start Building',
                description:
                  'Launch dev server and see changes instantly on mobile, desktop, or web.',
                tech: ['Hot Reload', 'Live Preview'],
                command: 'jetstart dev',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Step Card */}
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  {/* Step Number Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center font-bold text-xl md:text-2xl border-2"
                      style={{
                        backgroundColor: colors.altBg,
                        borderColor: colors.primary,
                        color: colors.primary,
                      }}
                    >
                      {item.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold mb-2">{item.title}</h3>
                        <div className="flex gap-2 mb-3">
                          {item.tech.map((tech, j) => (
                            <span
                              key={j}
                              className="px-2 py-1 rounded text-xs font-medium border"
                              style={{
                                backgroundColor: colors.altBg,
                                borderColor: colors.primary + '30',
                                color: colors.primary,
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-400 mb-4">{item.description}</p>

                    {/* Command Box */}
                    <div
                      className="p-4 rounded-lg border font-mono text-sm"
                      style={{
                        backgroundColor: colors.altBg,
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div className="flex gap-2">
                        <span style={{ color: colors.primary }}>$</span>
                        <span className="text-gray-300">{item.command}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connecting Line */}
                {i < 2 && (
                  <div
                    className="hidden sm:block absolute left-7 md:left-8 top-20 w-0.5 h-8"
                    style={{ backgroundColor: colors.primary + '30' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Tabs */}
      <section className="py-12 md:py-20 px-4 md:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">One codebase. Three previews.</h2>
            <p className="text-gray-400 text-base md:text-lg">Choose how you want to see your app</p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="flex flex-wrap md:flex-nowrap justify-center gap-2 mb-12 p-1 max-w-2xl mx-auto rounded-xl"
            style={{ backgroundColor: colors.altBg }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {[
              { icon: Smartphone, label: 'Mobile', id: 0 },
              { icon: Monitor, label: 'Desktop', id: 1 },
              { icon: Globe, label: 'Web', id: 2 },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: activeTab === tab.id ? colors.primary : 'transparent',
                  color: activeTab === tab.id ? colors.bgColor : colors.textColor,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <motion.div
            className="rounded-2xl border p-6 md:p-12"
            style={{
              backgroundColor: colors.altBg,
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {activeTab === 0 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="order-2 md:order-1">
                  <h3 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Mobile Client</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
                    Scan a QR code and instantly stream your app to your phone. Like Expo Go, but
                    for native Android with Kotlin & Compose.
                  </p>
                  <div className="space-y-3">
                    {[
                      'QR code instant setup',
                      'Live WebSocket streaming',
                      'Zero rebuild cycles',
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <CheckCircle2
                          className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                          style={{ color: colors.primary }}
                        />
                        <span className="text-sm md:text-base text-gray-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <motion.div
                  className="flex justify-center order-1 md:order-2"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div
                    className="w-32 h-64 md:w-48 md:h-96 rounded-3xl border-4 flex items-center justify-center relative overflow-hidden"
                    style={{
                      borderColor: colors.primary + '40',
                      backgroundColor: colors.bgColor,
                    }}
                  >
                    <Smartphone className="w-12 h-12 md:w-16 md:h-16" style={{ color: colors.primary + '60' }} />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <h3 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Desktop Emulator</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
                    Full Android emulator environment. Test hardware features, system APIs, and real
                    device behavior on your machine.
                  </p>
                  <div className="space-y-3">
                    {['AVD compatible', 'Hardware simulation', 'System-level testing'].map(
                      (item, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <CheckCircle2
                            className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                            style={{ color: colors.primary }}
                          />
                          <span className="text-sm md:text-base text-gray-300">{item}</span>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
                <motion.div
                  className="flex justify-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div
                    className="w-48 h-40 md:w-64 md:h-56 rounded-xl border-2 flex items-center justify-center relative overflow-hidden"
                    style={{
                      borderColor: colors.primary + '40',
                      backgroundColor: colors.bgColor,
                    }}
                  >
                    <Monitor className="w-16 h-16 md:w-20 md:h-20" style={{ color: colors.primary + '60' }} />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <h3 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Web Emulator</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
                    Preview your Android app directly in the browser. No SDK, no setup—just instant
                    feedback for rapid prototyping.
                  </p>
                  <div className="space-y-3">
                    {['Zero installation', 'Browser-based preview', 'Shareable demo links'].map(
                      (item, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <CheckCircle2
                            className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                            style={{ color: colors.primary }}
                          />
                          <span className="text-sm md:text-base text-gray-300">{item}</span>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
                <motion.div
                  className="flex justify-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div
                    className="w-full h-40 md:h-48 rounded-xl border-2 flex items-center justify-center relative overflow-hidden"
                    style={{
                      borderColor: colors.primary + '40',
                      backgroundColor: colors.bgColor,
                    }}
                  >
                    <Globe className="w-16 h-16 md:w-20 md:h-20" style={{ color: colors.primary + '60' }} />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Why JetStart */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
                Traditional Android IDEs
                <br />
                <span className="text-gray-500">slow you down</span>
              </h2>
              <div className="space-y-4">
                {[
                  'Slow rebuild cycles after every change',
                  'Heavy resource consumption',
                  'Complex setup and configuration',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 p-3 md:p-4 rounded-lg border"
                    style={{
                      backgroundColor: colors.altBg,
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: colors.orange }}
                    />
                    <span className="text-sm md:text-base text-gray-400">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
                <span style={{ color: colors.primary }}>JetStart is faster</span>
              </h2>
              <div className="space-y-4 pt-0 md:pt-8">
                {[
                  'Sub-100ms hot reload across all platforms',
                  'Lightweight VS Code integration',
                  'One command to start building',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 p-3 md:p-4 rounded-lg border"
                    style={{
                      backgroundColor: colors.altBg,
                      borderColor: colors.primary + '20',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <span className="text-sm md:text-base text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Everything you need</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: '<100ms hot reload' },
              { icon: Code2, title: 'Real Compose', desc: 'Actual Kotlin code' },
              { icon: Smartphone, title: 'Completely Wireless', desc: 'WiFi & Hotspot Support' },
              { icon: Terminal, title: 'Simple CLI', desc: '6 core commands' },
              { icon: Package, title: 'Open Source', desc: 'Fully extensible' },
              { icon: Rocket, title: 'Fast Builds', desc: 'Optimized workflow' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl border transition-all"
                style={{
                  backgroundColor: colors.altBg,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{
                  borderColor: colors.primary + '40',
                  y: -5,
                }}
              >
                <item.icon className="w-6 h-6 md:w-8 md:h-8 mb-3 md:mb-4" style={{ color: colors.primary }} />
                <h3 className="text-base md:text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-xs md:text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Latest Updates</h2>
            <p className="text-gray-400 text-base md:text-lg">Fresh from the blog</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {latestPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                className="rounded-xl border overflow-hidden flex flex-col"
                style={{
                  backgroundColor: colors.altBg,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, borderColor: colors.primary + '40' }}
              >
                {post.mainImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={urlFor(post.mainImage)}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 line-clamp-2">{post.title}</h3>
                  <div className="mt-auto pt-3 md:pt-4 flex items-center justify-between text-xs md:text-sm text-gray-400">
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-primary hover:underline whitespace-nowrap"
                      style={{ color: colors.primary }}
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-32 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to ship faster?
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-400 mb-8 md:mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Join developers building Android apps at lightning speed
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="https://www.npmjs.com/package/@jetstart/cli">
              <motion.button
                className="px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.bgColor,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
                Install CLI
              </motion.button>
            </Link>
            <Link to="/docs/getting-started/introduction">
              <motion.button
                className="px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 border transition-all"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                whileHover={{
                  borderColor: colors.primary + '40',
                  backgroundColor: colors.primary + '10',
                }}
              >
                <Book className="w-5 h-5" />
                Read Docs
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12 px-4 md:px-6" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="img/logos/logo.png"
                  alt="JetStart Logo"
                  className="w-8 h-8 rounded-md"
                />
                <span className="font-semibold">JetStart</span>
              </div>
              <p className="text-xs md:text-sm text-gray-200">Launch Android apps at warp speed</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 md:mb-3 text-xs md:text-sm">Docs</h3>
              <div className="space-y-2 text-xs md:text-sm">
                <a
                  href="/docs/getting-started/introduction"
                  className="block text-gray-200 hover:text-white transition"
                >
                  Getting Started
                </a>
                <a
                  href="/docs/cli/overview"
                  className="block text-gray-200 hover:text-white transition"
                >
                  CLI Reference
                </a>
                <a
                  href="/docs/architecture/overview"
                  className="block text-gray-200 hover:text-white transition"
                >
                  Architecture
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 md:mb-3 text-xs md:text-sm">Community</h3>
              <div className="space-y-2 text-xs md:text-sm">
                <a
                  href="https://github.com/dev-phantom/jetstart/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-200 hover:text-white transition"
                >
                  Discussions
                </a>
                <a
                  href="https://github.com/dev-phantom/jetstart/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-200 hover:text-white transition"
                >
                  Issues
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 md:mb-3 text-xs md:text-sm">More</h3>
              <div className="space-y-2 text-xs md:text-sm">
                <a href="/blogs" className="block text-gray-200 hover:text-white transition">
                  Blog
                </a>
                <a
                  href="https://www.npmjs.com/package/@jetstart/cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-200 hover:text-white transition"
                >
                  npm
                </a>
                <a
                  href="/docs/contributing/getting-started"
                  className="block text-gray-200 hover:text-white transition"
                >
                  Contributing
                </a>
              </div>
            </div>
          </div>
          <div
            className="pt-6 md:pt-8 border-t text-center text-xs md:text-sm text-gray-200"
            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            © {new Date().getFullYear()} JetStart. Built with Docusaurus.
          </div>
        </div>
      </footer>
    </div>
  );
}
