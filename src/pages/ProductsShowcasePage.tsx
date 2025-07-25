import { ExternalLink } from 'lucide-react';

const ProductsShowcasePage = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Invisalign",
      endorsement: "The Gold Standard in Clear Aligners",
      link: "https://www.invisalign.com",
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop&crop=center",
      size: "large", // Hero tile
      gradient: "from-blue-600/80 to-purple-600/80"
    },
    {
      id: 2,
      name: "Philips Sonicare DiamondClean",
      endorsement: "Unrivaled Plaque Removal",
      link: "https://www.philips.com/sonicare",
      image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&h=600&fit=crop&crop=center",
      size: "tall", // Vertical tile
      gradient: "from-teal-600/80 to-blue-600/80"
    },
    {
      id: 3,
      name: "Curaprox CS 5460 Toothbrush",
      endorsement: "Gentle Yet Supremely Effective",
      link: "https://curaprox.com/",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center",
      size: "standard", // Square tile
      gradient: "from-red-500/80 to-pink-600/80"
    },
    {
      id: 4,
      name: "Waterpik Aquarius Water Flosser",
      endorsement: "The Easiest Way to a Healthier Smile",
      link: "https://www.waterpik.com/",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center",
      size: "standard", // Square tile
      gradient: "from-cyan-600/80 to-teal-600/80"
    },
    {
      id: 5,
      name: "3M ESPE Filtek Composite",
      endorsement: "Professional's Choice for Restorations",
      link: "https://www.3m.com/dental",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center",
      size: "standard",
      gradient: "from-amber-600/80 to-orange-600/80"
    },
    {
      id: 6,
      name: "Nobel Biocare Implants",
      endorsement: "Innovation in Implant Excellence",
      link: "https://www.nobelbiocare.com/",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=500&fit=crop&crop=center",
      size: "medium", // Medium height
      gradient: "from-indigo-600/80 to-purple-600/80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              Curated Excellence
            </h1>
            <p className="text-xl text-gray-600 font-light leading-relaxed">
              Premium dental products personally selected and endorsed by the DentalReach team
            </p>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-12 gap-6 auto-rows-auto">
          {featuredProducts.map((product) => (
            <a
              key={product.id}
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2
                ${product.size === 'large' ? 'col-span-12 md:col-span-8 h-80 md:h-96' : ''}
                ${product.size === 'tall' ? 'col-span-12 md:col-span-4 h-80 md:h-[520px]' : ''}
                ${product.size === 'standard' ? 'col-span-12 sm:col-span-6 md:col-span-4 h-64 md:h-80' : ''}
                ${product.size === 'medium' ? 'col-span-12 sm:col-span-6 md:col-span-4 h-72 md:h-96' : ''}
              `}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${product.gradient} opacity-60 group-hover:opacity-40 transition-opacity duration-300`} />
              
              {/* DentalReach Badge */}
              <div className="absolute top-4 left-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-gray-800 flex items-center shadow-lg">
                  <div className="w-2 h-2 bg-dental-600 rounded-full mr-2"></div>
                  Recommended by DentalReach
                </div>
              </div>

              {/* External Link Icon */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg">
                  <ExternalLink className="h-4 w-4 text-gray-700" />
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute inset-0 -m-6 rounded-b-2xl"></div>
                <div className="relative z-10">
                  <h3 className={`
                    text-white font-medium mb-2 tracking-wide
                    ${product.size === 'large' ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}
                  `}>
                    {product.name}
                  </h3>
                  <p className={`
                    text-white/90 font-light leading-relaxed
                    ${product.size === 'large' ? 'text-base md:text-lg' : 'text-sm md:text-base'}
                  `}>
                    {product.endorsement}
                  </p>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-6 tracking-tight">
              Excellence in Every Recommendation
            </h3>
            <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
              Each product in our curated collection represents the pinnacle of dental innovation, 
              carefully selected by our team of dental professionals for their proven efficacy and superior quality.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-light text-dental-600 mb-2">{featuredProducts.length}+</div>
                <div className="text-sm text-gray-600 font-medium tracking-wide uppercase">Premium Brands</div>
              </div>
              <div>
                <div className="text-3xl font-light text-dental-600 mb-2">98%</div>
                <div className="text-sm text-gray-600 font-medium tracking-wide uppercase">Dentist Approval</div>
              </div>
              <div>
                <div className="text-3xl font-light text-dental-600 mb-2">4.8★</div>
                <div className="text-sm text-gray-600 font-medium tracking-wide uppercase">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsShowcasePage;
