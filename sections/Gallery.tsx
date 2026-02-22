"use client"

import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function Gallery() {
  // Array de todas las imágenes del carousel
  const images = [
    {
      src: "/assets/landing-carousel/bodega-vista.jpg",
      alt: "Vista panorámica de la bodega",
    },
    {
      src: "/assets/landing-carousel/experiencia-enoturistica.jpeg",
      alt: "Experiencia enoturística argentina",
    },
    {
      src: "/assets/landing-carousel/jornadas-cachi-01.jpeg",
      alt: "Jornadas del vino en Cachi",
    },
    {
      src: "/assets/landing-carousel/jornadas-cachi-02.jpeg",
      alt: "Paisaje vitivinícola de Cachi",
    },
    {
      src: "/assets/landing-carousel/vinedos-atardecer.jpg",
      alt: "Viñedos argentinos al atardecer",
    },
    {
      src: "/assets/landing-carousel/bodega-panoramica.jpg",
      alt: "Bodega y viñedos panorámica",
    },
    {
      src: "/assets/landing-carousel/terroir-argentino.jpg",
      alt: "Terroir vitivinícola argentino",
    },
    {
      src: "/assets/landing-carousel/sostenibilidad-enoturismo.jpg",
      alt: "Sostenibilidad en el enoturismo",
    },
    {
      src: "/assets/landing-carousel/vinedos-montanas.jpeg",
      alt: "Viñedos y montañas",
    },
    {
      src: "/assets/landing-carousel/paisaje-enoturistico.jpeg",
      alt: "Paisaje enoturístico",
    },
  ]

  return (
    <section className="w-full bg-gray-50 dark:bg-gray-900">
      <div className="w-full">
        <div className="flex justify-center w-full">
          <Carousel
            plugins={[
              Autoplay({ delay: 4000, stopOnInteraction: false }) as any
            ]}
            className="w-full"
            opts={{
              loop: true,
              align: "start",
            }}
          >
            <CarouselContent className="ml-0">
              {images.map((img, index) => (
                <CarouselItem key={index} className="pl-0 basis-full">
                  <div className="relative w-full h-125 md:h-150 lg:h-175">
                    <div className="w-full h-full relative bg-gray-200 flex items-center justify-center">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      /> 
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  )
}

