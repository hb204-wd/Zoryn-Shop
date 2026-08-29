import RatingStars from "./RatingStars";

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  content?: string | null;
  createdAt: Date | string;
  user: {
    name?: string | null;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">Aucun avis pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border border-gray-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a2332] text-xs font-semibold text-white">
                {(review.user.name ?? "A").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {review.user.name ?? "Anonyme"}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>
            <RatingStars rating={review.rating} showCount={false} size="sm" />
          </div>
          {review.title && (
            <h4 className="mb-1 text-sm font-semibold text-gray-900">
              {review.title}
            </h4>
          )}
          {review.content && (
            <p className="text-sm leading-relaxed text-gray-600">
              {review.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
