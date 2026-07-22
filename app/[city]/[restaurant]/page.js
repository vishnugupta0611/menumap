import RestaurantProfile from "@/components/public/RestaurantProfile";
import {
  findRestaurant,
  findRestaurantMenu,
  listReviews,
  listGallery,
} from "@/services/restaurant-service";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { city, restaurant: slug } = await params;

  const restaurant = await findRestaurant(city, slug);

  // Fix: Removed trailing ' | HeyRestro' so it doesn't duplicate with root layout template
  const title = `${restaurant.name} | Best Restaurant in ${restaurant.city}`;

  const description = `Explore ${restaurant.name} located in ${restaurant.city}. View menu, address, contact details, photos, reviews, opening hours and discover the best dining experience with HeyRestro.`;

  const image =
    restaurant.logoImage ||
    restaurant.heroImage ||
    "https://heyrestro.com/og-image.png";

  const canonical = `https://heyrestro.com/${city}/${slug}`;

  const keywords = [
    restaurant.name,
    `${restaurant.name} menu`,
    `${restaurant.name} restaurant`,
    `${restaurant.name} ${restaurant.city}`,
    `${restaurant.city} restaurants`,
    `Restaurants in ${restaurant.city}`,
    "Restaurant Menu",
    "Digital Menu",
    "QR Menu",
    "Food Near Me",
    "HeyRestro",
  ];

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "HeyRestro",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function RestaurantPage({ params }) {
  const { city, restaurant: slug } = await params;

  const restaurant = await findRestaurant(city, slug);
  const menu = await findRestaurantMenu(city, slug);
  const reviews = await listReviews(city, slug);
  const gallery = await listGallery(city, slug);

  const url = `https://heyrestro.com/${city}/${slug}`;
  const image = restaurant.logoImage || restaurant.heroImage || "https://heyrestro.com/og-image.png";
  const geo = restaurant.location?.lat && restaurant.location?.lng ? {
    "@type": "GeoCoordinates",
    latitude: restaurant.location.lat,
    longitude: restaurant.location.lng,
  } : undefined;

  const aggregateRating = reviews?.length > 0 ? {
    "@type": "AggregateRating",
    ratingValue: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1),
    reviewCount: reviews.length,
  } : undefined;

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    image: image,
    url: url,
    telephone: restaurant.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressCountry: "IN",
    },
    geo: geo,
    servesCuisine: restaurant.cuisine || "Multi-cuisine",
    openingHours: "Mo-Su 10:00-23:00",
    menu: `${url}/menu`,
    acceptsReservations: "True",
    priceRange: "₹₹",
    sameAs: restaurant.socialLinks ? Object.values(restaurant.socialLinks).filter(Boolean) : [],
    aggregateRating,
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    additionalType: "http://schema.org/Restaurant",
    name: restaurant.name,
    image: image,
    logo: restaurant.logoImage || image,
    telephone: restaurant.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressCountry: "IN",
    },
    geo: geo,
    openingHours: "Mo-Su 10:00-23:00",
    priceRange: "₹₹",
    url: url,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://heyrestro.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: restaurant.city,
        item: `https://heyrestro.com/search?city=${restaurant.city}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: restaurant.name,
        item: url,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${restaurant.name} | Best Restaurant in ${restaurant.city}`,
    description: `Explore ${restaurant.name} located in ${restaurant.city}. View menu, address, contact details, photos, reviews, opening hours and discover the best dining experience.`,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: image,
    },
    url: url,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: "HeyRestro",
      logo: {
        "@type": "ImageObject",
        url: "https://heyrestro.com/logo.png",
      },
    },
  };

  const faqs = [
    {
      question: `Where is ${restaurant.name} located?`,
      answer: `${restaurant.name} is located at ${restaurant.address}, ${restaurant.city}.`,
    },
    {
      question: `What cuisine is served at ${restaurant.name}?`,
      answer: `They serve a variety of delicious dishes, primarily focusing on ${restaurant.cuisine || "multi-cuisine"} food.`,
    },
    {
      question: `What are the opening hours for ${restaurant.name}?`,
      answer: `${restaurant.name} is generally open from 10:00 AM to 11:00 PM. We recommend calling ahead to confirm on public holidays.`,
    },
    {
      question: `Does ${restaurant.name} offer takeaway or food delivery?`,
      answer: `Yes, ${restaurant.name} offers both dine-in and takeaway services. You can explore their digital menu online.`,
    },
    {
      question: `Does ${restaurant.name} provide a QR menu?`,
      answer: `Yes! You can view their complete digital QR menu on HeyRestro for a seamless dining experience.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Generate an SEO optimized description if missing
  const aboutText = restaurant.longDescription || `Welcome to ${restaurant.name}, a premier dining destination located in the heart of ${restaurant.city}. Conveniently situated at ${restaurant.address}, ${restaurant.name} is renowned for serving authentic and delicious ${restaurant.cuisine || "food"} that delights locals and travelers alike. Whether you are looking for a quick bite, a cozy family dinner, or a digital QR menu experience, this restaurant provides a top-notch ambiance paired with exceptional culinary standards. Discover our diverse food directory, explore our detailed restaurant menu online, and experience the best food delivery and dine-in services in ${restaurant.city}. From mouth-watering specialties to refreshing beverages, every dish is crafted to perfection. Join us at ${restaurant.name} to explore the best restaurant near you.`;

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <article>
        <RestaurantProfile
          restaurant={restaurant}
          menu={menu}
          reviews={reviews}
          gallery={gallery}
        />
      </article>

      {/* SEO Optimized Minimal Bottom Section */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-surface-container-highest/20 mt-12 bg-surface text-on-surface-variant">
        
        {/* FAQs - Accordion Style */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-surface-container-low p-4 rounded-xl group cursor-pointer border border-surface-container-highest/20">
                <summary className="font-semibold text-on-surface list-none flex justify-between items-center outline-none">
                  {faq.question}
                  <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:-rotate-180">
                    expand_more
                  </span>
                </summary>
                <p className="text-sm mt-4 text-on-surface-variant leading-relaxed border-t border-surface-container-highest/20 pt-4">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Internal Linking / Local SEO Footer */}
        <footer>
          <h3 className="text-lg font-bold text-on-surface mb-4">Explore More</h3>
          <nav aria-label="Internal Links" className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/" className="hover:text-primary hover:underline" aria-label="Go to HeyRestro Home">Home</Link>
            <Link href={`/search?city=${restaurant.city}`} className="hover:text-primary hover:underline" aria-label={`View other restaurants in ${restaurant.city}`}>Restaurants in {restaurant.city}</Link>
            <Link href={`/${city}/${slug}/menu`} className="hover:text-primary hover:underline" aria-label={`View ${restaurant.name} Digital Menu`}>{restaurant.name} Menu</Link>
            <Link href="/about" className="hover:text-primary hover:underline" aria-label="About HeyRestro">About HeyRestro</Link>
            <Link href="/contact" className="hover:text-primary hover:underline" aria-label="Contact HeyRestro">Contact</Link>
            <Link href="/privacy" className="hover:text-primary hover:underline" aria-label="Privacy Policy">Privacy Policy</Link>
          </nav>
          
          <address className="mt-8 not-italic text-xs opacity-70 border-t border-surface-container-highest/20 pt-4">
            <strong>{restaurant.name}</strong><br />
            {restaurant.address}<br />
            {restaurant.city}, India<br />
            {restaurant.phone && <a href={`tel:${restaurant.phone}`} aria-label={`Call ${restaurant.name}`}>{restaurant.phone}</a>}
          </address>
        </footer>
      </section>
    </main>
  );
}
