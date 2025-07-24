import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  id: string;
  title: string;
  artist: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  onClick?: (id: string) => void;
}

const ProductCard = ({ 
  id, 
  title, 
  artist, 
  price, 
  originalPrice,
  image, 
  category,
  isLiked = false,
  onLike,
  onAddToCart,
  onClick 
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(isLiked);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    onLike?.(id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(id);
  };

  const handleClick = () => {
    onClick?.(id);
  };

  return (
    <div 
      className="group cursor-pointer bg-card rounded-lg overflow-hidden shadow-card hover:shadow-artwork transition-all duration-300 transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-artwork">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Category Badge */}
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm">
          {category}
        </Badge>

        {/* Action Buttons */}
        <div className={`absolute top-3 right-3 flex flex-col space-y-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}>
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 bg-background/90 hover:bg-background backdrop-blur-sm"
            onClick={handleLike}
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                liked ? 'fill-red-500 text-red-500' : 'text-foreground'
              }`} 
            />
          </Button>
          
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 bg-background/90 hover:bg-background backdrop-blur-sm"
          >
            <Eye className="w-4 h-4 text-foreground" />
          </Button>
        </div>

        {/* Overlay on Hover */}
        <div className={`absolute inset-0 bg-primary/20 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary-hover text-primary-foreground transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">
            by {artist}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">
              ${price.toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {originalPrice && originalPrice > price && (
            <Badge variant="destructive" className="text-xs">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;