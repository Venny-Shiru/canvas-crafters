import { useState } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid3X3, Grid2X2 } from "lucide-react";
import artwork1 from "@/assets/artwork-1.jpg";
import artwork2 from "@/assets/artwork-2.jpg";
import artwork3 from "@/assets/artwork-3.jpg";

// Mock data for artworks
const mockArtworks = [
  {
    id: "1",
    title: "Ocean Dreams",
    artist: "Marina Blue",
    price: 1200,
    originalPrice: 1500,
    image: artwork1,
    category: "Abstract",
  },
  {
    id: "2",
    title: "Mountain Serenity",
    artist: "Sky Walker",
    price: 800,
    image: artwork2,
    category: "Landscape",
  },
  {
    id: "3",
    title: "Geometric Harmony",
    artist: "Alex Shapes",
    price: 950,
    originalPrice: 1100,
    image: artwork3,
    category: "Modern",
  },
  {
    id: "4",
    title: "Urban Reflections",
    artist: "City Artist",
    price: 750,
    image: artwork1,
    category: "Urban",
  },
  {
    id: "5",
    title: "Natural Flow",
    artist: "Nature Lover",
    price: 1100,
    image: artwork2,
    category: "Nature",
  },
  {
    id: "6",
    title: "Color Burst",
    artist: "Vibrant Soul",
    price: 1350,
    image: artwork3,
    category: "Abstract",
  }
];

const categories = ["All", "Abstract", "Landscape", "Modern", "Urban", "Nature"];

const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [gridColumns, setGridColumns] = useState(3);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const filteredArtworks = selectedCategory === "All" 
    ? mockArtworks 
    : mockArtworks.filter(artwork => artwork.category === selectedCategory);

  const handleLike = (id: string) => {
    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(id)) {
      newLikedItems.delete(id);
    } else {
      newLikedItems.add(id);
    }
    setLikedItems(newLikedItems);
  };

  const handleAddToCart = (id: string) => {
    // TODO: Implement add to cart functionality
    console.log("Added to cart:", id);
  };

  const handleProductClick = (id: string) => {
    // TODO: Navigate to product detail page
    console.log("View product:", id);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Featured Artworks
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover unique pieces from our curated collection of contemporary art
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                className={`cursor-pointer px-4 py-2 transition-smooth ${
                  selectedCategory === category 
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover" 
                    : "hover:bg-secondary"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Grid Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 border border-border rounded-lg p-1">
              <Button
                variant={gridColumns === 2 ? "default" : "ghost"}
                size="sm"
                onClick={() => setGridColumns(2)}
              >
                <Grid2X2 className="w-4 h-4" />
              </Button>
              <Button
                variant={gridColumns === 3 ? "default" : "ghost"}
                size="sm"
                onClick={() => setGridColumns(3)}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className={`grid gap-6 ${
          gridColumns === 2 
            ? "grid-cols-1 md:grid-cols-2" 
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {filteredArtworks.map((artwork) => (
            <ProductCard
              key={artwork.id}
              {...artwork}
              isLiked={likedItems.has(artwork.id)}
              onLike={handleLike}
              onAddToCart={handleAddToCart}
              onClick={handleProductClick}
            />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Load More Artworks
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;