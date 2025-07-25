import React from 'react';
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
  Play
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create. Collaborate. 
              <span className="text-blue-600 block">Craft Together.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate digital canvas platform for artists, designers, and creative teams. 
              Draw, design, and collaborate in real-time with powerful tools and seamless sharing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {state.isAuthenticated ? (
                <>
                  <Link
                    to="/canvas/new"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    Start Creating
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/explore"
                    className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    Explore Canvases
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/explore"
                    className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    View Demo
                  </Link>
                </>
              )}
            </div>

            {/* Hero Image Placeholder */}
            <div className="mt-16 relative">
              <div className="bg-white rounded-2xl shadow-2xl p-4 mx-auto max-w-4xl">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Palette className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Interactive Canvas Preview</p>
                    <p className="text-gray-500 text-sm mt-2">Real-time collaboration in action</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">3 users online</span>
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">Auto-saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade tools meet seamless collaboration in one powerful platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gray-50 rounded-2xl p-6 group-hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our intuitive workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Canvas</h3>
              <p className="text-gray-600">
                Start with a blank canvas or choose from our templates. Set your dimensions and preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Invite Collaborators</h3>
              <p className="text-gray-600">
                Share your canvas link with team members. They can join instantly and start contributing.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Together</h3>
              <p className="text-gray-600">
                Watch as ideas come to life in real-time. Save, share, and export your masterpiece.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Creators Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what artists, designers, and teams are saying about Canvas Crafters
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of artists and designers who are already using Canvas Crafters
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {state.isAuthenticated ? (
              <Link
                to="/canvas/new"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
              >
                Create Your First Canvas
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                >
                  Sign Up Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  Log In
                </Link>
              </>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Unlimited canvases</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;