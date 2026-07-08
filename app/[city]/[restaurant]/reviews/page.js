import MaterialIcon from "@/components/stitch/MaterialIcon";
import SectionHeading from "@/components/stitch/SectionHeading";
import { findRestaurant, listReviews } from "@/services/restaurant-service";

export default async function ReviewsPage({ params }) {
  const { city, restaurant: slug } = await params;
  const restaurant = await findRestaurant(city, slug);
  const reviews = await listReviews();

  return (
    <div className="mx-auto max-w-4xl px-margin-mobile pb-32">
      <SectionHeading title="Reviews" />
      <div className="space-y-4 mt-6">
        {reviews.map((review) => (
          <article
            key={review.id || review._id}
            className="rounded-[24px] border border-surface-container bg-white p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center text-primary font-bold text-lg">
                {review.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold">{review.name}</h4>
                <div className="my-1 flex text-primary">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <MaterialIcon key={index} name="star" className="text-[16px] fill text-primary" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-on-surface-variant font-body-md leading-relaxed">"{review.text}"</p>
          </article>
        ))}
      </div>
    </div>
  );
}
