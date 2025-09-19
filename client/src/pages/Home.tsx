import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Palette,
  Users,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Home: React.FC = () => {
  const { state } = useAuth();

  const features = [
    {
      icon: <Palette className="w-8 h-8 text-blue-600" />,
      title: 'Digital Canvas',
      description: 'Create stunning digital artwork with professional-grade drawing tools and unlimited canvas size.'
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: 'Real-time Collaboration',
      description: 'Work together with friends and colleagues in real-time, seeing each others changes instantly.'
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: 'Lightning Fast',
      description: 'Built with modern technology for smooth, responsive drawing experience with no lag.'
    },
    {
      icon: <Globe className="w-8 h-8 text-purple-600" />,
      title: 'Share Anywhere',
      description: 'Publish your creations to the world or keep them private. Share links instantly with anyone.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Digital Artist',
      content: 'Canvas Crafters has revolutionized how I collaborate with other artists. The real-time editing is seamless!',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      name: 'Mike Johnson',
      role: 'UX Designer',
      content: 'Perfect for brainstorming sessions with my team. We can all contribute ideas visually in real-time.',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Art Teacher',
      content: 'My students love using Canvas Crafters for group projects. It makes learning collaborative and fun!',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  // Slideshow data for Interactive Canvas Preview
  const slideshowSlides = [
    {
      id: 1,
      title: 'Digital Art Masterpiece',
      description: 'Collaborative artwork created by 5 artists',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      users: ['Alice', 'Bob', 'Carol'],
      category: 'Abstract Art'
    },
    {
      id: 2,
      title: 'Creative Workspace Design',
      description: 'Real-time design collaboration in progress',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      users: ['David', 'Eve'],
      category: 'UI/UX Design'
    },
    {
      id: 3,
      title: 'Vibrant Paint Palette',
      description: 'Color exploration and artistic experimentation',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
      users: ['Frank', 'Grace', 'Henry'],
      category: 'Color Study'
    },
    {
      id: 4,
      title: 'Geometric Patterns',
      description: 'Mathematical art meets creative expression',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
      users: ['Iris', 'Jack'],
      category: 'Geometric Art'
    }
  ];

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowSlides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [slideshowSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowSlides.length) % slideshowSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 relative overflow-hidden">
      {/* Artistic Background Elements */}
      <div className="absolute inset-0 bg-artistic-gradient opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-sunset-gradient rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-ocean-gradient rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delayed"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-forest-gradient rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>

      {/* Hero Section - Enhanced with artistic design */}
      <section className="relative bg-gradient-to-br from-aurora-gradient via-white to-cosmic-gradient dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            {/* Artistic decorative elements */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-transparent bg-clip-text bg-artistic-gradient mb-6 leading-tight animate-gradient">
              Create. Collaborate.
              <span className="block text-4xl md:text-6xl lg:text-7xl font-artistic font-normal text-purple-600 dark:text-purple-400 mt-2">
                Craft Together.
              </span>
            </h1>

            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 font-body leading-relaxed">
                The ultimate digital canvas platform for artists, designers, and creative teams.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-body">
                Draw, design, and collaborate in real-time with powerful tools and seamless sharing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {state.isAuthenticated ? (
                <>
                  <Link
                    to="/canvas/new"
                    className="group bg-artistic-gradient text-white px-10 py-4 rounded-2xl text-xl font-bold hover:shadow-artistic-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center glow"
                  >
                    <Palette className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Start Creating
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/explore"
                    className="group border-3 border-purple-500 text-purple-600 px-10 py-4 rounded-2xl text-xl font-bold hover:bg-purple-500 hover:text-white transition-all duration-300 hover:shadow-artistic"
                  >
                    <Users className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
                    Explore Canvases
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:shadow-artistic-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center glow"
                  >
                    <Star className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Get Started Free
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/explore"
                    className="group border-3 border-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 px-10 py-4 rounded-2xl text-xl font-bold hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white transition-all duration-300 hover:shadow-artistic"
                  >
                    <Play className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
                    View Demo
                  </Link>
                </>
              )}
            </div>

            {/* Interactive Canvas Preview Slideshow */}
            <div className="mt-20 relative">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-artistic-lg p-6 mx-auto max-w-5xl border border-white/20">
                <div className="aspect-video bg-gradient-to-br from-aurora-gradient to-cosmic-gradient rounded-2xl relative overflow-hidden shadow-inner">
                  {/* Slideshow Images */}
                  <div className="absolute inset-0">
                    {slideshowSlides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg"></div>
                      </div>
                    ))}
                  </div>

                  {/* Slide Content Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white z-10">
                      <Palette className="w-16 h-16 text-white mx-auto mb-4 drop-shadow-lg" />
                      <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                        {slideshowSlides[currentSlide].title}
                      </h3>
                      <p className="text-lg mb-2 drop-shadow-lg">
                        {slideshowSlides[currentSlide].description}
                      </p>
                      <div className="flex items-center justify-center space-x-2 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{slideshowSlides[currentSlide].users.length} collaborators</span>
                        <span className="mx-2">•</span>
                        <span>{slideshowSlides[currentSlide].category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {slideshowSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentSlide
                            ? 'bg-white scale-110'
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {slideshowSlides[currentSlide].users.length} users online
                  </span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Auto-saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-ocean-gradient rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-forest-gradient rounded-full opacity-10 animate-float-delayed"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-full px-6 py-2">
                <span className="text-purple-600 font-artistic text-lg">✨ Everything You Need</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-artistic-gradient mb-6">
              To Create Masterpieces
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-body leading-relaxed">
              Professional-grade tools meet seamless collaboration in one powerful, beautifully designed platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 group-hover:bg-white dark:group-hover:bg-gray-800 transition-all duration-300 shadow-artistic group-hover:shadow-artistic-lg transform group-hover:-translate-y-2 border border-white/50 dark:border-gray-700/50">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-body leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started in minutes with our intuitive workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create Your Canvas</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Start with a blank canvas or choose from our templates. Set your dimensions and preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Invite Collaborators</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share your canvas link with team members. They can join instantly and start contributing.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create Together</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Watch as ideas come to life in real-time. Save, share, and export your masterpiece.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Creators Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See what artists, designers, and teams are saying about Canvas Crafters
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
              <Palette className="w-5 h-5 text-purple-300" />
              <span className="text-white font-semibold text-lg">Ready to Create?</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6 leading-tight drop-shadow-lg">
              Start Your Creative Journey
            </h2>
            <p className="text-xl md:text-2xl text-white/95 mb-12 font-body leading-relaxed max-w-3xl mx-auto drop-shadow-sm">
              Join thousands of artists and designers who are already creating masterpieces with Canvas Crafters
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            {state.isAuthenticated ? (
              <Link
                to="/canvas/new"
                className="group bg-white text-purple-600 px-10 py-4 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center shadow-artistic-lg transform hover:-translate-y-1 glow"
              >
                <Palette className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                Create Your First Canvas
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group bg-white text-purple-600 px-10 py-4 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center shadow-artistic-lg transform hover:-translate-y-1 glow"
                >
                  <Star className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Sign Up Free
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="group border-3 border-white text-white px-10 py-4 rounded-2xl text-xl font-bold hover:bg-white hover:text-purple-600 transition-all duration-300 shadow-artistic transform hover:-translate-y-1"
                >
                  <Users className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
                  Log In
                </Link>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-300" />
              </div>
              <h3 className="text-white font-display font-bold text-lg mb-2">Free to Start</h3>
              <p className="text-white/80 font-body">No upfront costs or hidden fees</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-300" />
              </div>
              <h3 className="text-white font-display font-bold text-lg mb-2">No Credit Card</h3>
              <p className="text-white/80 font-body">Sign up without payment information</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-300" />
              </div>
              <h3 className="text-white font-display font-bold text-lg mb-2">Unlimited Canvases</h3>
              <p className="text-white/80 font-body">Create as many projects as you want</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;