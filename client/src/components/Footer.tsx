import React from 'react';
import { Link } from 'react-router-dom';
import { Palette } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-3">
              <Palette className="w-6 h-6 text-blue-500 mr-2" />
              <span className="text-xl font-bold">Canvas Crafters</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md text-sm">
              The premier collaborative digital canvas platform. Create, collaborate, and craft amazing artwork together in real-time.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.997 1.482-1.997.699 0 1.035.525 1.035 1.155 0 .703-.449 1.754-.681 2.729-.194.819.412 1.488 1.219 1.488 1.464 0 2.589-1.544 2.589-3.774 0-1.979-1.42-3.361-3.449-3.361-2.349 0-3.728 1.763-3.728 3.589 0 .71.272 1.471.611 1.884.067.08.076.149.056.23-.061.254-.196.796-.223.907-.035.146-.116.177-.268.107-1.001-.465-1.624-1.926-1.624-3.1 0-2.523 1.834-4.84 5.287-4.84 2.781 0 4.943 1.981 4.943 4.628 0 2.757-1.739 4.976-4.151 4.976-.811 0-1.573-.421-1.834-.925l-.498 1.902c-.181.695-.669 1.566-.995 2.097A12.013 12.013 0 0 0 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-1">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link to="/canvas/new" className="text-gray-400 hover:text-white transition-colors text-sm">Create Canvas</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
              <li><Link to="/explore" className="text-gray-400 hover:text-white transition-colors text-sm">Explore</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-base font-semibold mb-3">Contact & Support</h3>
            <ul className="space-y-1">
              <li>
                <a href="mailto:support@canvascrafters.com" className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@canvascrafters.com
                </a>
              </li>
              <li>
                <a href="mailto:feedback@canvascrafters.com" className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                  </svg>
                  feedback@canvascrafters.com
                </a>
              </li>
              <li>
                <a href="https://github.com/Venny-Shiru/canvas-crafters" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
                  <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub Repository
                </a>
              </li>
              <li>
                <span className="text-gray-400 flex items-center text-sm">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  24/7 Support Available
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2025 Canvas Crafters. All rights reserved.
          </div>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
