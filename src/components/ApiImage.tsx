import Image from "next/image";
import type { ApiImage as ApiImageData } from "@/lib/api-types";

type Props = {
  image: ApiImageData;
  /** The width the image occupies, e.g. "(min-width: 1024px) 600px, 100vw". Tells the browser which size to fetch. */
  sizes: string;
  /** Only for the one image at the top of the page that is the largest visible element. */
  priority?: boolean;
  className?: string;
  alt?: string;
};

/** Renders an image from the API at its real width and height, so the layout never shifts. */
export function ApiImage({ image, sizes, priority = false, className, alt }: Props) {
  return (
    <Image
      src={image.url}
      width={image.width}
      height={image.height}
      alt={alt ?? image.alt ?? ""}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}