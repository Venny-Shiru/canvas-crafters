import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Palette 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="bg-gradient-artwork rounded-2xl p-8 mb-12 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Stay Updated with New Collections
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Be the first to know about new artworks, exclusive offers, and artist spotlights.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <Input 
              placeholder="Enter your email"
              className="flex-1 bg-background border-border"
            />
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <Mail className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">ArtCrafters</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connecting art lovers with extraordinary works from talented artists worldwide. 
              Discover, collect, and support the arts community.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Instagram className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">Gallery</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">Artists</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">Collections</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">New Arrivals</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">On Sale</a>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Categories</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">Abstract Art</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">Landscapes</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">Portraits</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">Modern Art</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth text-sm">Digital Art</a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  123 Art Street, Gallery District, NY 10001
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  hello@artcrafters.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 ArtCrafters. All rights reserved.
          </div>
          <nav className="flex flex-wrap items-center space-x-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Terms of Service</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Cookie Policy</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Support</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;