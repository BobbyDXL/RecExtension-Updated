import { motion } from 'framer-motion'
import { FiYoutube, FiSettings, FiShield, FiMoon, FiCoffee } from 'react-icons/fi'
import { BiAnalyse, BiReset, BiFilterAlt } from 'react-icons/bi'
import { MdOutlinePrivacyTip, MdOutlineSpeed, MdOutlineStorage } from 'react-icons/md'
import { HiOutlineLightningBolt, HiOutlinePhotograph } from 'react-icons/hi'
import { Link, useNavigate } from 'react-router-dom'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5 }
}

const Home = () => {
  console.log('RecFix Landing Page - Home Component Rendered')
  const navigate = useNavigate()

  return (
    <>
      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span>Take Control of Your</span>
            <span className="text-indigo-600 flex items-center gap-2">
              YouTube Feed <FiYoutube className="text-4xl md:text-5xl" />
            </span>
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            RecFix helps you analyze, filter, and improve your YouTube recommendations. Get content you actually want to see, without the noise.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:space-x-4 px-4"
          >
            <button 
              onClick={() => navigate('/guide')}
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <HiOutlineLightningBolt className="text-xl" />
              Install RecFix Now
            </button>
            <a 
              href="https://ko-fi.com/bobbydxl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-50 transition-colors border-2 border-indigo-600 flex items-center justify-center gap-2"
            >
              <FiCoffee className="text-xl" />
              Support Us
            </a>
          </motion.div>

          {/* Product Hunt Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex justify-center"
          >
            <a 
              href="https://www.producthunt.com/posts/recfix-extension?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-recfix&#0045;extension" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-90 transition-opacity"
            >
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=770528&theme=neutral&t=1736448002427" 
                alt="RecFix Extension - Fix your YouTube recommendations, fast and hassle-free" 
                width="250" 
                height="54" 
              />
            </a>
          </motion.div>

          {/* Install Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex items-center justify-center gap-8 text-gray-600"
          >
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 rounded-full p-2">
                <HiOutlineLightningBolt className="text-xl text-indigo-600" />
              </div>
              <div className="text-left">
                <motion.div 
                  className="text-2xl font-bold text-indigo-600"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    delay: 1
                  }}
                >
                  <motion.span
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 0.3,
                      repeat: 5,
                      repeatDelay: 3
                    }}
                  >
                    10,547
                  </motion.span>
                </motion.div>
                <span className="text-sm">Active Users</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-purple-100 rounded-full p-2">
                <BiAnalyse className="text-xl text-purple-600" />
              </div>
              <div className="text-left">
                <motion.div 
                  className="text-2xl font-bold text-purple-600"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    delay: 1.2
                  }}
                >
                  <motion.span
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 0.3,
                      repeat: 5,
                      repeatDelay: 3,
                      delay: 0.15
                    }}
                  >
                    156,832
                  </motion.span>
                </motion.div>
                <span className="text-sm">Recommendations Fixed</span>
              </div>
            </div>
          </motion.div>
        
          {/* Hero Visual */}
          <motion.div 
            className="mt-8 md:mt-16 relative px-4 sm:px-0"
            variants={scaleIn}
            initial="initial"
            animate="animate"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-1">
              <div className="bg-white rounded-xl p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Video Card 1 */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiYoutube className="text-gray-400 text-3xl md:text-4xl" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-gray-900 text-white text-xs px-1 rounded">
                        10:24
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-100 rounded w-5/6 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  </div>

                  {/* Video Card 2 - Hidden on mobile */}
                  <div className="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiYoutube className="text-gray-400 text-3xl md:text-4xl" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-gray-900 text-white text-xs px-1 rounded">
                        15:31
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                    </div>
                  </div>

                  {/* Video Card with Analysis Overlay - Hidden on tablet */}
                  <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative group">
                    <div className="aspect-video bg-gray-100 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiYoutube className="text-gray-400 text-3xl md:text-4xl" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-gray-900 text-white text-xs px-1 rounded">
                        8:45
                      </div>
                      <motion.div 
                        className="absolute inset-0 bg-indigo-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{ scale: [0.95, 1] }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="text-white text-center p-2">
                          <BiAnalyse className="text-2xl md:text-3xl mx-auto mb-1" />
                          <div className="text-xs font-medium">Analyzing Content</div>
                        </div>
                      </motion.div>
                    </div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-100 rounded w-4/5 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    <motion.div 
                      className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <BiFilterAlt className="text-sm" />
                    </motion.div>
                  </div>
                </div>

                {/* Analysis Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Analyzing recommendations...</span>
                    <span>67%</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "67%" }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-2 sm:-right-4 -top-2 sm:-top-4 bg-indigo-600 text-white p-2 sm:p-3 rounded-full shadow-lg">
              <BiFilterAlt className="text-xl sm:text-2xl" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 flex items-center justify-center gap-3">
            <FiSettings className="text-indigo-600" />
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-indigo-600 mb-4 text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Dark Mode Preview */}
      <motion.section 
        className="py-20 bg-gradient-to-b from-gray-900 to-indigo-900 text-white overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 text-indigo-500/10 text-[400px] -mt-40 -mr-40"
          >
            <FiMoon />
          </motion.div>
          <h2 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
            <FiMoon className="text-indigo-400" />
            Beautiful Dark Mode
          </h2>
          <p className="text-xl mb-8 text-gray-300">Enjoy a seamless experience day and night with our automatic dark mode. Perfect for your late-night YouTube sessions.</p>
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-2xl mx-auto relative">
            <div className="absolute -right-3 -top-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-indigo-500 rounded-full p-2"
              >
                <FiMoon className="text-xl" />
              </motion.div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <motion.div 
                className="h-4 bg-gray-700 rounded w-3/4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.div>
              <motion.div 
                className="h-4 bg-gray-700 rounded w-1/2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              ></motion.div>
              <motion.div 
                className="h-4 bg-gray-700 rounded w-2/3"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How it Works */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 flex items-center justify-center gap-3">
            <MdOutlineSpeed className="text-indigo-600" />
            How RecFix Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/4 right-0 w-full h-0.5 bg-indigo-100">
                    <div className="animate-pulse h-full w-1/2 bg-indigo-500"></div>
                  </div>
                )}
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mx-auto mb-4 relative">
                  {step.icon}
                  <div className="absolute -right-2 -top-2 bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Privacy Section */}
      <motion.section 
        className="py-20 bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900 text-white overflow-hidden relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Background Decoration */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block p-3 bg-indigo-500/20 rounded-full mb-4"
            >
              <FiShield className="text-4xl text-indigo-400" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Privacy Matters</h2>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
              We believe in absolute transparency and security. Your data never leaves your browser - it's that simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Local Storage Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20"
            >
              <div className="bg-indigo-500/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MdOutlineStorage className="text-2xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Local Storage</h3>
              <p className="text-indigo-200">
                Your data never leaves your device. Everything is stored securely in your browser's local storage.
              </p>
            </motion.div>

            {/* No Tracking Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20"
            >
              <div className="bg-indigo-500/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MdOutlinePrivacyTip className="text-2xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Zero Tracking</h3>
              <p className="text-indigo-200">
                We don't track, collect, or store any personal information. Your privacy is guaranteed.
              </p>
            </motion.div>

            {/* API Security Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20"
            >
              <div className="bg-indigo-500/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FiShield className="text-2xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Encrypted Security</h3>
              <p className="text-indigo-200">
                Your YouTube API key is encrypted and stored securely in your browser's protected storage.
              </p>
            </motion.div>
          </div>

          {/* Trust Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 max-w-3xl mx-auto text-center backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <FiShield className="text-2xl text-indigo-400" />
              <span className="text-xl font-bold text-white">Trust & Transparency</span>
            </div>
            <p className="text-indigo-200">
              RecFix is open source and our code is publicly available. We believe in complete transparency about how your data is handled.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="bg-indigo-600 py-20 text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute right-0 top-0 text-indigo-500/20 text-[400px] -mt-40 -mr-40"
        >
          <HiOutlineLightningBolt />
        </motion.div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6">Ready to Fix Your YouTube Experience?</h2>
          <p className="text-xl mb-8 text-indigo-100">Join thousands of users who have already improved their recommendations.</p>
          <motion.button
            onClick={() => navigate('/guide')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 mx-auto"
          >
            <HiOutlineLightningBolt className="text-xl" />
            Add to Chrome - It's Free
          </motion.button>
          <p className="text-sm mt-4 text-indigo-200 flex items-center justify-center gap-2">
            <HiOutlineLightningBolt className="text-xl" />
            2 recommendation fixes per day included
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FiYoutube className="text-2xl text-indigo-500" />
              <span className="text-white font-semibold">RecFix</span>
            </div>
            <p className="mb-4">© 2025 RecFix. All rights reserved.</p>
            <div className="space-x-4">
              <Link 
                to="/privacy" 
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <MdOutlinePrivacyTip />
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <FiShield />
                Terms of Service
              </Link>
              <Link 
                to="/feedback" 
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <BiAnalyse />
                Contact
              </Link>
              <a 
                href="https://github.com/BobbyDXL" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <FiYoutube />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

const features = [
  {
    icon: <HiOutlinePhotograph className="text-4xl" />,
    title: "Snapshot Analysis",
    description: "Take snapshots of your current recommendations and analyze them to understand what YouTube thinks you like."
  },
  {
    icon: <BiFilterAlt className="text-4xl" />,
    title: "Smart Filtering",
    description: "Mark videos you want to prioritize and let our algorithm guide YouTube towards better recommendations."
  },
  {
    icon: <BiReset className="text-4xl" />,
    title: "Save & Reset",
    description: "Save curated recommendations as playlists or reset your feed when you want a fresh start."
  },
  {
    icon: <FiMoon className="text-4xl" />,
    title: "Dark Mode",
    description: "Enjoy a beautiful dark theme that automatically adjusts to your system preferences."
  },
  {
    icon: <HiOutlineLightningBolt className="text-4xl" />,
    title: "Rate Limited",
    description: "2 fixes per day to ensure optimal performance and prevent API quota exhaustion."
  },
  {
    icon: <FiShield className="text-4xl" />,
    title: "Privacy First",
    description: "Your data stays on your device. We never collect or store your personal information."
  }
]

const steps = [
  {
    icon: <HiOutlineLightningBolt className="text-2xl" />,
    title: "Install RecFix",
    description: "Add the extension to Chrome with just one click. No account required."
  },
  {
    icon: <FiSettings className="text-2xl" />,
    title: "Configure API",
    description: "Set up your YouTube API key through our guided process."
  },
  {
    icon: <BiAnalyse className="text-2xl" />,
    title: "Scan Your Feed",
    description: "Let RecFix analyze your current YouTube recommendations."
  },
  {
    icon: <BiAnalyse className="text-2xl" />,
    title: "Enjoy Better Content",
    description: "Watch as your recommendations become more relevant to your interests."
  }
]

const privacyFeatures = [
  {
    icon: <MdOutlineStorage className="text-4xl" />,
    title: "Local Storage",
    description: "All your data is stored securely in your browser"
  },
  {
    icon: <MdOutlinePrivacyTip className="text-4xl" />,
    title: "No Tracking",
    description: "We don't collect any personal information"
  },
  {
    icon: <FiShield className="text-4xl" />,
    title: "API Security",
    description: "Your YouTube API key is stored with encryption"
  }
]

export default Home 