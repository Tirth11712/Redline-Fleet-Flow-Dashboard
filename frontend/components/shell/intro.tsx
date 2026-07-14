'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const BOOT_LINES = [
  'INITIALIZING FLEET CONSOLE',
  'LOADING VEHICLE REGISTRY .... OK',
  'SYNCING DRIVER MANIFESTS ... OK',
  'BUSINESS RULES ENGINE ...... ARMED',
]

export function Intro() {
  const [show, setShow] = useState(false)
  const [phase, setPhase] = useState<'boot' | 'wordmark' | 'exit'>('boot')
  const [lineCount, setLineCount] = useState(0)

  useEffect(() => {
    // if (sessionStorage.getItem('redline-intro')) return
    // sessionStorage.setItem('redline-intro', '1')
    setShow(true)

    const lineTimers = BOOT_LINES.map((_, i) =>
      setTimeout(() => setLineCount(i + 1), 250 + i * 320),
    )
    const t1 = setTimeout(() => setPhase('wordmark'), 1700)
    const t2 = setTimeout(() => setPhase('exit'), 3400)
    const t3 = setTimeout(() => setShow(false), 4100)
    return () => {
      lineTimers.forEach(clearTimeout)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-background"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
          aria-hidden="true"
        >
          {/* red glow backdrop */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'boot' ? 0 : 1 }}
            transition={{ duration: 1 }}
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.35 0.16 27 / 55%), transparent 70%)',
            }}
          />

          {phase === 'boot' && (
            <div className="relative flex flex-col gap-2 font-mono text-xs tracking-widest text-muted-foreground">
              {BOOT_LINES.slice(0, lineCount).map((line) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-primary">{'>'}</span> {line}
                </motion.span>
              ))}
              <span className="animate-pulse-dot mt-1 inline-block h-3 w-2 bg-primary" />
            </div>
          )}

          {phase !== 'boot' && (
            <div className="relative flex flex-col items-center px-6">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground"
              >
                FLEET OPERATIONS CONSOLE
              </motion.p>
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-[18vw] leading-[0.85] tracking-tight text-foreground md:text-[11rem]"
                >
                  REDLINE
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring', stiffness: 300, damping: 15 }}
                    className="inline-block text-primary"
                  >
                    .
                  </motion.span>
                </motion.h1>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
                className="mt-6 h-px w-full origin-left bg-primary"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mt-4 font-mono text-[10px] tracking-[0.35em] text-muted-foreground"
              >
                VEHICLES / DRIVERS / TRIPS / COST CONTROL
              </motion.p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
