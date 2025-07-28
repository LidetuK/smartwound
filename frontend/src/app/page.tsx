"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Modal from "@/components/Modal";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";

const translations = {
  en: {
    smartWound: "Smart Wound",
    logIn: "Log In",
    getStarted: "Get Started",
    heroTitle: "The Future of Wound Care is Here.",
    heroSubtitle: "Your personal AI companion for tracking healing, getting safe guidance, and connecting with support. Take control of your recovery journey.",
    startTracking: "Start Tracking for Free",
    assistantTitle: "An Intelligent Assistant for Every Step",
    photoCheckTitle: "AI Photo Check",
    photoCheckDesc: "Upload a photo to classify your wound type. Get instant, safe guidance and alerts for severe conditions.",
    chatTitle: "GPT-Powered Chat",
    chatDesc: "Ask questions and get general wound care advice from our AI chatbot, available 24/7.",
    trackerTitle: "Healing Tracker",
    trackerDesc: "Log daily progress with photos and notes. Visualize your healing journey and get smart reminders.",
    howItWorksTitle: "Simple Steps to Smarter Healing",
    step1Title: "Upload a Photo.",
    step1Desc: "Snap a picture of your wound to begin.",
    step2Title: "Get AI Insights.",
    step2Desc: "Receive safe care tips and wound classification.",
    step3Title: "Track & Heal.",
    step3Desc: "Log daily photos and notes to monitor your progress.",
    safetyTitle: "Important: Your Safety is Our Priority",
    safetyDesc: "Smart Wound is an informational tool, not a substitute for professional medical diagnosis or treatment. Always consult a healthcare provider for any medical concerns.",
    about: "About Us",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
    copyright: "Smart Wound. All rights reserved.",
    aboutTitle: "About Smart Wound",
    aboutDesc1: "Smart Wound is an AI-powered wound care companion designed to help you track healing, get safe guidance, and connect with support. Our mission is to empower anyone, anywhere to take control of their recovery journey with confidence and peace of mind.",
    aboutDesc2: "We combine advanced image analysis, smart reminders, and a supportive AI assistant to make wound care simple, safe, and accessible for everyone.",
  },
  am: {
    smartWound: "ብልጥ ቁስል",
    logIn: "ይግቡ",
    getStarted: "ይጀምሩ",
    heroTitle: "የወደፊቱ የ Wound እንክብካቤ እዚህ አለ",
    heroSubtitle: "የእርስዎ የግል ሰው ሰራሽ ረዳት ፈውስን ለመከታተል፣ ደህንነቱ የተጠበቀ መመሪያ ለማግኘት እና ከድጋፍ ጋር ለመገናኘት። የማገገም ጉዞዎን ይቆጣጠሩ።",
    startTracking: "በነጻ መከታተል ይጀምሩ",
    assistantTitle: "ለሁሉም እርምጃ የማሰብ ችሎታ ያለው ረዳት",
    photoCheckTitle: "የ AI ፎቶ ማረጋገጫ",
    photoCheckDesc: "የቁስልዎን አይነት ለመለየት ፎቶ ይስቀሉ። ፈጣን፣ ደህንነቱ የተጠበቀ መመሪያ እና ለከባድ ሁኔታዎች ማንቂያዎችን ያግኙ።",
    chatTitle: "በGPT-የሚሰራ ውይይት",
    chatDesc: "ጥያቄዎችን ይጠይቁ እና ከእኛ AI chatbot አጠቃላይ የቁስል እንክብካቤ ምክር ያግኙ፣ 24/7 ይገኛል።",
    trackerTitle: "የፈውስ መከታተያ",
    trackerDesc: "የየቀኑን ሂደት በፎቶዎች እና ማስታወሻዎች ይመዝግቡ። የፈውስ ጉዞዎን በዓይነ ሕሊናዎ ይመልከቱ እና ዘመናዊ አስታዋሾችን ያግኙ።",
    howItWorksTitle: "ወደ ዘመናዊ ፈውስ ቀላል ደረጃዎች",
    step1Title: "ፎቶ ይስቀሉ።",
    step1Desc: "ለመጀመር የቁስልዎን ፎቶ አንሳ።",
    step2Title: "የ AI ግንዛቤዎችን ያግኙ።",
    step2Desc: "ደህንነቱ የተጠበቀ የእንክብካቤ ምክሮችን እና የቁስል ምደባን ይቀበሉ።",
    step3Title: "ይከታተሉ እና ይፈውሱ።",
    step3Desc: "ሂደትዎን ለመከታተል የየቀኑን ፎቶዎች እና ማስታወሻዎች ይመዝግቡ።",
    safetyTitle: "አስፈላጊ፡ የእርስዎ ደህንነት ቅድሚያ የምንሰጠው ጉዳይ ነው",
    safetyDesc: "ስማርት ቁስል የመረጃ መሳሪያ ነው፣ ለሙያዊ የህክምና ምርመራ ወይም ህክምና ምትክ አይደለም። ለማንኛውም የህክምና ጉዳይ ሁል ጊዜ የጤና እንክብካቤ አቅራቢን ያማክሩ።",
    about: "ስለ እኛ",
    privacy: "የ ግል የሆነ",
    terms: "የአገልግሎት ውል",
    contact: "ያግኙን",
    copyright: "ብልጥ ቁስል. መብቱ በህግ የተጠበቀ ነው.",
    aboutTitle: "ስለ ብልጥ ቁስል",
    aboutDesc1: "ብልጥ ቁስል የ AI የተደገፈ የቁስል እንክብካቤ ባለሙያ ነው፣ የሚረዳዎት ፈውስን ለመከታተል፣ ደህንነቱ የተጠበቀ መመሪያ ለማግኘት እና ከድጋፍ ጋር ለመገናኘት። ተቋማችን ማንኛውንም ሰው በማንኛውም ቦታ የማገገም ጉዞውን በእምነትና በሰላም እንዲቆጣጠር ማድረግ ነው ዓላማችን።",
    aboutDesc2: "የረጅም ስርዓተ ምስል ትንተና፣ ዘመናዊ አስታዋሾች እና የሚደግፉ የ AI ረዳቶችን በመዋደድ የቁስል እንክብካቤን ቀላል፣ ደህናነቱ የተጠበቀ እና ለሁሉም የሚደርስ እንዲሆን እንደምንሠራ ነው።",
  }
};

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[language];

  // Smooth scroll and active section highlight
  useEffect(() => {
    document.body.style.scrollBehavior = 'smooth';
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
      
      const sections = ['about', 'features', 'how', 'contact'];
      let found = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom > 100) {
            found = id;
            break;
          }
        }
      }
      setActiveSection(found);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased">
      {/* Header */}
      <nav className={`w-full py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300 sticky top-0 z-50 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-indigo-100' 
          : 'bg-white/80 backdrop-blur-lg'
      }`}>
        <div className="flex items-center group cursor-pointer">
          <div className="relative">
            <Image 
              src="/favicon-32x32.png" 
              alt="Smart Wound Logo" 
              width={40} 
              height={40} 
              className="mr-3 transition-transform duration-300 group-hover:scale-110" 
            />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-indigo-700 drop-shadow-sm">
            {t.smartWound}
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection('about')} 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 ${
              activeSection === 'about' 
                ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {t.about}
          </button>
          <button 
            onClick={() => scrollToSection('features')} 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 ${
              activeSection === 'features' 
                ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('how')} 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 ${
              activeSection === 'how' 
                ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 ${
              activeSection === 'contact' 
                ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {t.contact}
          </button>
          
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setLanguage('am')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                language === 'am' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              am
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                language === 'en' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              en
            </button>
          </div>
          
          <button
            onClick={openLogin}
            className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors duration-200"
          >
            {t.logIn}
          </button>
          <button
            onClick={openSignup}
            className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {t.getStarted}
          </button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setMobileMenuOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex justify-end">
          <div className="w-4/5 max-w-xs h-full bg-white shadow-lg flex flex-col p-6 relative animate-slide-in">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-indigo-600 text-2xl"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              &times;
            </button>
            <nav className="flex flex-col gap-4 mt-10">
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection('about'); }} className="text-lg font-medium text-gray-700 hover:text-indigo-600 text-left">{t.about}</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection('features'); }} className="text-lg font-medium text-gray-700 hover:text-indigo-600 text-left">Features</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection('how'); }} className="text-lg font-medium text-gray-700 hover:text-indigo-600 text-left">How It Works</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection('contact'); }} className="text-lg font-medium text-gray-700 hover:text-indigo-600 text-left">{t.contact}</button>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setLanguage('am'); }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${language === 'am' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >am</button>
                <button
                  onClick={() => { setLanguage('en'); }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${language === 'en' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >en</button>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); openLogin(); }}
                className="text-indigo-600 font-semibold mt-4 text-left"
              >{t.logIn}</button>
              <button
                onClick={() => { setMobileMenuOpen(false); openSignup(); }}
                className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-full shadow-md hover:bg-indigo-700 transition mt-2 text-left"
              >{t.getStarted}</button>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex-grow">
        <section
          className="relative py-16 md:py-24 px-6 md:px-12 flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-white overflow-hidden"
        >
          {/* Left: Illustration */}
          <div className="w-full md:w-1/2 flex justify-center items-center mb-10 md:mb-0 md:mr-10">
            <div className="relative">
              <img
                src="/smartwound-bg.png"
                alt="Smart Wound Illustration"
                className="w-[320px] md:w-[400px] lg:w-[480px] rounded-3xl shadow-2xl border-4 border-white bg-white object-contain"
                style={{ maxHeight: '480px' }}
              />
              {/* Accent: floating heart icon */}
              <div className="absolute top-6 left-6 animate-bounce-slow">
                <svg className="w-10 h-10 text-indigo-400 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              </div>
              {/* Accent: floating plus icon */}
              <div className="absolute bottom-6 right-6 animate-pulse">
                <svg className="w-8 h-8 text-blue-300 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          {/* Right: Text and CTA */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10">
            {/* Hero Heading with per-letter hover-bold effect */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight drop-shadow-xl cursor-pointer select-none">
              {t.heroTitle.split("").map((char, i) => (
                <span
                  key={i}
                  className="transition-all duration-200 hover:font-black hover:tracking-wider"
                  style={{ display: char === " " ? "inline-block" : undefined, minWidth: char === " " ? "0.5em" : undefined }}
                >
                  {char}
                </span>
              ))}
            </h1>
            <p className="text-lg md:text-2xl text-gray-600 mb-8 max-w-xl leading-relaxed drop-shadow">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center md:items-start w-full">
              <button
                onClick={openSignup}
                className="group bg-indigo-600 text-white font-bold px-6 py-2 rounded-full shadow-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 text-base relative overflow-hidden"
              >
                <span className="relative z-10">{t.startTracking}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/80 px-4 py-2 rounded-full shadow">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free to start • No credit card required</span>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 md:py-28 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {t.aboutTitle}
              </h2>
              <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-xl text-gray-700 leading-relaxed">
                  {t.aboutDesc1}
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t.aboutDesc2}
                </p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl p-8 shadow-lg">
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Care</h3>
                  <p className="text-gray-600">Advanced technology meets compassionate care</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {t.assistantTitle}
              </h2>
              <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need for smarter wound care in one place
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📸</div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">{t.photoCheckTitle}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t.photoCheckDesc}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-indigo-600 font-medium">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🤖</div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">{t.chatTitle}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t.chatDesc}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-indigo-600 font-medium">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📈</div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">{t.trackerTitle}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t.trackerDesc}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-indigo-600 font-medium">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="py-20 md:py-28 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {t.howItWorksTitle}
              </h2>
              <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
            </div>
            {/* Modern Timeline Steps */}
            <div className="relative">
              {/* Vertical line for timeline */}
              <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-indigo-200 to-indigo-400 z-0" style={{ transform: 'translateX(-50%)' }} />
              <div className="flex flex-col gap-4 relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-center md:items-start md:justify-start md:gap-8">
                  <div className="hidden md:flex flex-1 justify-end"></div>
                  <div className="flex flex-col items-center md:items-end flex-1 md:pr-8">
                    <div className="relative mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xl font-bold shadow-lg border-4 border-white z-10">1</div>
                      <div className="absolute left-1/2 top-full w-1 h-8 bg-indigo-200 z-0" style={{ transform: 'translateX(-50%)' }}></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-2xl p-6 md:max-w-xs text-right border-l-4 border-indigo-400">
                      <h3 className="font-bold text-lg mb-1 text-gray-900">{t.step1Title}</h3>
                      <p className="text-gray-600 text-base">{t.step1Desc}</p>
                    </div>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col md:flex-row items-center md:items-start md:justify-end md:gap-8">
                  <div className="flex flex-col items-center md:items-start flex-1 md:pl-8">
                    <div className="relative mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xl font-bold shadow-lg border-4 border-white z-10">2</div>
                      <div className="absolute left-1/2 top-full w-1 h-8 bg-indigo-200 z-0" style={{ transform: 'translateX(-50%)' }}></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-2xl p-6 md:max-w-xs text-left border-r-4 border-indigo-400">
                      <h3 className="font-bold text-lg mb-1 text-gray-900">{t.step2Title}</h3>
                      <p className="text-gray-600 text-base">{t.step2Desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-1 justify-end"></div>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col md:flex-row items-center md:items-start md:justify-start md:gap-8">
                  <div className="hidden md:flex flex-1 justify-end"></div>
                  <div className="flex flex-col items-center md:items-end flex-1 md:pr-8">
                    <div className="relative mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xl font-bold shadow-lg border-4 border-white z-10">3</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-2xl p-6 md:max-w-xs text-right border-l-4 border-indigo-400">
                      <h3 className="font-bold text-lg mb-1 text-gray-900">{t.step3Title}</h3>
                      <p className="text-gray-600 text-base">{t.step3Desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Safety Disclaimer Banner (bottom of page) */}
        <div className="w-full flex justify-center items-center py-4 px-4">
          <div className="flex items-center gap-3 max-w-2xl w-full mx-auto rounded-xl bg-gradient-to-r from-red-100/80 via-white/70 to-orange-100/80 backdrop-blur-md shadow-lg border border-red-200 px-4 py-3 md:py-4">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-200/60">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-xs md:text-sm text-red-800 font-medium leading-snug">
              <span className="font-semibold">Important: Your Safety is Our Priority.</span> Smart Wound is an informational tool, not a substitute for professional medical diagnosis or treatment. Always consult a healthcare provider for any medical concerns.
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-28 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">Contact Us</h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Have questions, feedback, or want to partner with us? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:info@smartwound.com" 
                className="group bg-indigo-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@smartwound.com
              </a>
              <div className="text-gray-500 text-sm">
                We typically respond within 24 hours
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Image src="/favicon-32x32.png" alt="Smart Wound Logo" width={32} height={32} className="mr-3" />
                <span className="text-xl font-bold text-indigo-700">{t.smartWound}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Empowering individuals to take control of their wound care journey with AI-powered insights and support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link></li>
                <li><Link href="/support" className="text-gray-600 hover:text-indigo-600 transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">{t.about}</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">{t.privacy}</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">{t.terms}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500">&copy; {new Date().getFullYear()} {t.copyright}</p>
          </div>
        </div>
      </footer>

      <Modal open={showLogin} onClose={() => setShowLogin(false)}>
        <LoginForm onSwitchToSignup={openSignup} onSuccess={() => setShowLogin(false)} />
      </Modal>
      <Modal open={showSignup} onClose={() => setShowSignup(false)}>
        <SignupForm onSwitchToLogin={openLogin} onSuccess={() => setShowSignup(false)} />
      </Modal>
    </div>
  );
}
