import Image, { type ImageProps } from "next/image";
import { isStoredUploadImageSrc } from "@/lib/product-image";

type ProductImageProps = Omit<ImageProps, "unoptimized"> & {
  src: string;
};

/** Product/category images from /api/uploads must skip the image optimizer. */
export function ProductImage({ src, alt, ...rest }: ProductImageProps) {
  return <Image src={src} alt={alt} unoptimized={isStoredUploadImageSrc(src)} {...rest} />;
}
