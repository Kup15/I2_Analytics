import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import LoginPage from './LoginPage';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir="rtl">
      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col">
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between px-6 py-4 md:px-12"
        >
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="I2 Analytics" className="h-12 w-12 rounded-xl object-cover" />
          </div>
          <Button
            onClick={() => setShowLogin(true)}
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
          >
            התחברות
          </Button>
        </motion.nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-12">
          <div className="max-w-4xl text-center space-y-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground"
            >
              <TrendingUp className="h-4 w-4 text-accent" />
              פלטפורמת ניתוח ביצועים לכדורסל
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight"
            >
              I2 Analytics
              <br />
              <span className="text-accent">הופכים פוטנציאל למצוינות.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              ניתוח משחקים מעמיק וליווי אישי – כדי שתמיד תהיו צעד אחד לפני כולם.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => setShowLogin(true)}
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 font-bold shadow-lg shadow-accent/25"
              >
                התחל עכשיו
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <a href="https://wa.me/972526124759" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-success hover:underline text-sm font-medium">
            <span className="text-lg">💬</span>
            לשאלות והתייעצויות — 052-6124759
          </a>
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="I2 Analytics" className="h-9 w-9 rounded-lg object-cover" />
              <span className="font-bold">I2 Analytics</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 I2 Analytics. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
