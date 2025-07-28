import { motion, animate } from 'framer-motion';
import { ChevronRight, BookOpen, Globe, Award, Calendar, Users, ShoppingBag, Building2 } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// AnimatedStat: micro-interaction for stat tiles
const AnimatedStat = ({ value, label }: { value: string; label: string }) => {
  // Extract numeric part and suffix (e.g., 75,000+)
  const match = value.match(/([\d,]+)(\D*)/);
  const target = match ? parseInt(match[1].replace(/,/g, '')) : 0;
  const suffix = match ? match[2] : '';
  const [display, setDisplay] = useState(target);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingBack = useRef(false);

  // Animate back to real value
  const animateToTarget = () => {
    isAnimatingBack.current = true;
    animate(display, target, {
      duration: 0.7,
      onUpdate: v => setDisplay(Math.round(v)),
      onComplete: () => {
        isAnimatingBack.current = false;
        setDisplay(target);
      }
    });
  };

  // On hover: randomize, then after 1.2s animate back
  const handleMouseEnter = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isAnimatingBack.current = false;
    intervalRef.current = setInterval(() => {
      // Random number in similar range
      const min = Math.max(0, target - Math.floor(target * 0.3));
      const max = target + Math.floor(target * 0.3);
      setDisplay(Math.floor(Math.random() * (max - min + 1)) + min);
    }, 40);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      animateToTarget();
    }, 1200);
  };

  // On leave: animate back immediately if not already animating
  const handleMouseLeave = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isAnimatingBack.current) {
      animateToTarget();
    }
  };

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Format with commas
  const format = (n: number) => n.toLocaleString();

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-md cursor-pointer select-none"
      whileHover={{ scale: 1.06 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <p className="text-3xl font-bold text-dental-700 mb-2">
        {format(display)}{suffix}
      </p>
      <p className="text-neutral-600">{label}</p>
    </motion.div>
  );
};

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  useEffect(() => {
    document.title = 'DentalReach – Home';
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section relative pt-10 pb-32 md:pt-16 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 bg-gradient-to-bl from-dental-500 to-dental-600 rounded-bl-[100px]"></div>
          <div className="absolute left-0 bottom-0 w-1/3 h-2/3 opacity-3 bg-gradient-to-tr from-dental-700 to-dental-800 rounded-tr-[80px]"></div>
          
          {/* Floating elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-dental-200/20 rounded-full blur-2xl float-element"></div>
          <div className="absolute bottom-32 left-32 w-24 h-24 bg-dental-300/20 rounded-full blur-xl float-element"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="hero-content grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="gradient-text-red">Build Authority.</span><br />
                <span className="text-slate-800">Gain Recognition.</span><br />
                <span className="text-slate-900">Share Knowledge.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Join the world's first all-in-one digital platform exclusively for dental professionals. Connect, learn, and grow with peers around the globe.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {!isAuthenticated && (
                  <RouterLink
                    to="/register"
                    className="btn btn-primary btn-lg group"
                  >
                    <span className="btn-text flex items-center">
                      Join DentalReach
                      <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                  </RouterLink>
                )}
                <RouterLink to="/articles" className="btn btn-secondary btn-lg group">
                  <span className="btn-text flex items-center">
                  Explore Articles
                  <ChevronRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </RouterLink>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-dental-500/20 to-dental-700/20 rounded-3xl blur-xl transform rotate-3"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-premium border border-white/20">
              <img 
                src="https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Dental professionals collaborating" 
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
              </div>
            </motion.div>
          </div>
          
          {/* Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {[
              { label: 'Dental Professionals', value: '75,000+' },
              { label: 'Published Articles', value: '12,500+' },
              { label: 'Countries Reached', value: '140+' },
              { label: 'Years of Excellence', value: '7+' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="stats-card text-center"
              >
                <div className="stats-card-value mb-2">
                  <AnimatedStat value={stat.value} label="" />
                </div>
                <div className="stats-card-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Featured Sections */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="section-header">
            <h2 className="section-title">
              Discover Our <span className="text-dental-600">Featured Sections</span>
            </h2>
            <div className="section-divider"></div>
            <p className="section-subtitle">
              DentalReach offers a comprehensive ecosystem of resources, connections, and opportunities for dental professionals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-container animate">
            {[
              { 
                icon: <BookOpen className="h-8 w-8 text-dental-600" />,
                title: 'Articles & Journals',
                description: 'Stay updated with the latest research, case studies, and clinical techniques.',
                link: '/articles'
              },
              { 
                icon: <Users className="h-8 w-8 text-dental-600" />,
                title: 'Community Forum',
                description: 'Connect with peers, ask questions, and share your expertise with professionals worldwide.',
                link: '/forum'
              },
              { 
                icon: <Calendar className="h-8 w-8 text-dental-600" />,
                title: 'Events & Webinars',
                description: 'Attend virtual and in-person events to expand your knowledge and network.',
                link: '/events'
              },
              { 
                icon: <Building2 className="h-8 w-8 text-dental-600" />,
                title: 'Business Listings',
                description: 'Discover dental clinics, laboratories, and service providers around the world.',
                link: '/business-listings'
              },
              { 
                icon: <ShoppingBag className="h-8 w-8 text-dental-600" />,
                title: 'Products Showcase',
                description: 'Explore the latest dental products, equipment, and materials in the market.',
                link: '/products'
              },
              { 
                icon: <Award className="h-8 w-8 text-dental-600" />,
                title: 'Digital Awards',
                description: 'Recognizing innovation and excellence in digital dentistry.',
                link: '/awards'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="feature-card stagger-item"
              >
                <div className="feature-card-icon">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                <RouterLink to={feature.link} className="link-elegant text-dental-600 font-medium flex items-center justify-center">
                  Explore <ChevronRight className="h-4 w-4 ml-1" />
                </RouterLink>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose <span className="text-dental-600">DentalReach?</span>
            </h2>
            <p className="text-lg text-neutral-700 max-w-3xl mx-auto">
              Join thousands of dental professionals who trust DentalReach for their professional growth and networking needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-12 w-12 text-dental-600" />,
                title: 'Global Network',
                description: 'Connect with over 75,000+ dental professionals from 140+ countries worldwide.',
                stats: '75,000+ Members'
              },
              {
                icon: <BookOpen className="h-12 w-12 text-dental-600" />,
                title: 'Quality Content',
                description: 'Access peer-reviewed articles, case studies, and the latest research in dentistry.',
                stats: '12,500+ Articles'
              },
              {
                icon: <Award className="h-12 w-12 text-dental-600" />,
                title: 'Recognition',
                description: 'Build your professional reputation and get recognized for your expertise.',
                stats: '500+ Awards Given'
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="bg-dental-50 rounded-full w-20 h-20 flex items-center justify-center mb-6 mx-auto">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-900">{benefit.title}</h3>
                <p className="text-neutral-600 mb-4">{benefit.description}</p>
                <div className="text-dental-600 font-bold text-lg">{benefit.stats}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Success <span className="text-dental-600">Stories</span>
            </h2>
            <p className="text-lg text-neutral-700 max-w-3xl mx-auto">
              Real stories from dental professionals who have grown their careers through DentalReach.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Sarah Chen',
                role: 'Oral Surgeon',
                location: 'Singapore',
                quote: 'DentalReach helped me connect with colleagues globally and stay updated with the latest surgical techniques.',
                achievement: 'Published 15+ articles'
              },
              {
                name: 'Dr. Miguel Rodriguez',
                role: 'Orthodontist',
                location: 'Spain',
                quote: 'The platform\'s forum discussions have been invaluable for complex case consultations.',
                achievement: 'Top contributor 2024'
              },
              {
                name: 'Dr. Priya Patel',
                role: 'Pediatric Dentist',
                location: 'India',
                quote: 'I\'ve learned so much from webinars and built meaningful professional relationships.',
                achievement: 'Speaker at 5+ events'
              }
            ].map((story, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-dental-50 to-white rounded-2xl p-6 shadow-lg border border-dental-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dental-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {story.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-neutral-900">{story.name}</h4>
                    <p className="text-sm text-neutral-600">{story.role} • {story.location}</p>
                  </div>
                </div>
                <blockquote className="text-neutral-700 italic mb-4">"{story.quote}"</blockquote>
                <div className="text-dental-600 font-medium text-sm">{story.achievement}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                Advanced Features for <span className="text-dental-600">Modern Dentistry</span>
              </h2>
              <p className="text-lg text-neutral-700 mb-8">
                Our platform is built with cutting-edge technology to provide the best experience for dental professionals.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <Globe className="h-6 w-6 text-dental-600" />,
                    title: 'Global Accessibility',
                    description: 'Access the platform from anywhere in the world with multi-language support.'
                  },
                  {
                    icon: <BookOpen className="h-6 w-6 text-dental-600" />,
                    title: 'Smart Content Discovery',
                    description: 'AI-powered recommendations help you find relevant articles and discussions.'
                  },
                  {
                    icon: <Users className="h-6 w-6 text-dental-600" />,
                    title: 'Professional Verification',
                    description: 'Verified profiles ensure you\'re connecting with genuine dental professionals.'
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="bg-dental-50 rounded-lg p-3 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                      <p className="text-neutral-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-dental-600 to-dental-700 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900">Platform Stats</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Active Users</span>
                      <span className="font-bold text-dental-600">75,000+</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Articles Published</span>
                      <span className="font-bold text-dental-600">12,500+</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Countries</span>
                      <span className="font-bold text-dental-600">140+</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Job Opportunities</span>
                      <span className="font-bold text-dental-600">2,000+</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-dental-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the DentalReach Community?</h2>
          <p className="text-lg text-dental-100 max-w-2xl mx-auto mb-8">
            Connect with thousands of dental professionals, access exclusive content, and stay at the forefront of dental innovation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <RouterLink to="/register" className="btn-primary px-8 py-3 text-base text-white hover:bg-dental-700 hover:text-white transition-colors duration-200 ease-in-out">
              Join Now
            </RouterLink>
            <RouterLink to="/articles" className="btn-primary px-8 py-3 text-base text-white hover:bg-dental-700 hover:text-white transition-colors duration-200 ease-in-out">
              Explore Content
            </RouterLink>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;