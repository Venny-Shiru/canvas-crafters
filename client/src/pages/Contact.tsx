import React, { useState } from 'react';
import { Mail, MessageSquare, Github, Clock, Send, CheckCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Contact form submitted:', formData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Get help with technical issues, billing, or general questions',
      contact: 'support@canvascrafters.com',
      responseTime: 'Usually responds within 24 hours'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Feature Requests',
      description: 'Share your ideas for new features or improvements',
      contact: 'feedback@canvascrafters.com',
      responseTime: 'We review all suggestions weekly'
    },
    {
      icon: <Github className="w-6 h-6" />,
      title: 'Open Source',
      description: 'Report bugs, contribute code, or browse the source',
      contact: 'GitHub Repository',
      responseTime: 'Community-driven support'
    }
  ];

  const faqItems = [
    {
      question: 'How do I collaborate with others on a canvas?',
      answer: 'Simply share your canvas URL with team members. They can join instantly and start drawing together in real-time.'
    },
    {
      question: 'Is my artwork automatically saved?',
      answer: 'Yes! Canvas Crafters auto-saves your work every few seconds. You\'ll see a "saved" indicator when changes are stored.'
    },
    {
      question: 'Can I export my canvas in different formats?',
      answer: 'Currently, you can export as PNG. We\'re working on adding more formats like SVG and PDF in future updates.'
    },
    {
      question: 'Is there a limit to canvas size or number of collaborators?',
      answer: 'Free accounts have generous limits. For teams needing more, we\'re developing premium plans with unlimited features.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to help you create amazing collaborative artwork. Reach out with questions, feedback, or just to say hello!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Methods */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Methods</h2>
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {method.description}
                      </p>
                      <div className="space-y-2">
                        {method.title === 'Open Source' ? (
                          <a
                            href="https://github.com/Venny-Shiru/canvas-crafters"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            {method.contact}
                          </a>
                        ) : (
                          <a
                            href={`mailto:${method.contact}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            {method.contact}
                          </a>
                        )}
                        <div className="flex items-center text-gray-500 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {method.responseTime}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Business Hours */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="text-gray-900">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekend</span>
                  <span className="text-gray-900">Limited support</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Currently online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="general">General Question</option>
                        <option value="technical">Technical Support</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                        <option value="collaboration">Collaboration Issue</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of your message"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Please provide as much detail as possible..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {item.question}
                    </h3>
                    <p className="text-gray-600">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
