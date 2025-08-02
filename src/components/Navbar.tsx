import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useGame } from '../contexts/GameContext';
import { 
  SunIcon, 
  MoonIcon, 
  CodeBracketIcon, 
  TrophyIcon, 
  BookOpenIcon, 
  UserIcon, 
  BoltIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { userProgress, isOnline } = useGame();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: CodeBracketIcon },
    { path: '/learn', label: 'Learn', icon: BookOpenIcon },
    { path: '/arena', label: 'Arena', icon: TrophyIcon },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  const navItemVariants = {
    initial: { y: 0 },
    hover: { 
      y: -2,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <>
      <motion.nav 
        className={clsx(
          "fixed top-0 w-full z-50 transition-all duration-300",
          isScrolled 
            ? "navbar-scrolled py-2" 
            : "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl py-4"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div 
                className="relative"
                variants={logoVariants}
                initial="initial"
                whileHover="hover"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CodeBracketIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-2xl font-bold gradient-text">
                  CodeCraft
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Master DSA Visually
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <motion.div
                    key={item.path}
                    variants={navItemVariants}
                    initial="initial"
                    whileHover="hover"
                    className="relative"
                  >
                    <Link
                      to={item.path}
                      className={clsx(
                        "relative px-4 py-2 rounded-xl transition-all duration-300 group flex items-center space-x-2",
                        isActive 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-xl -z-10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* XP Display */}
              <motion.div 
                className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full glass"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <BoltIcon className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold gradient-text">
                  {userProgress.xp.toLocaleString()} XP
                </span>
                {!isOnline && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Offline Mode"></div>
                )}
              </motion.div>

              {/* Level Badge */}
              <motion.div 
                className="px-3 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-sm font-bold">L{userProgress.level}</span>
              </motion.div>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-3 rounded-xl glass hover:shadow-lg focus-ring"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 rounded-xl glass hover:shadow-lg focus-ring"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Bars3Icon className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-0 right-0 z-40 md:hidden"
          >
            <div className="mx-4 glass rounded-2xl p-6 shadow-2xl">
              <div className="space-y-4">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={clsx(
                          "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300",
                          isActive 
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;